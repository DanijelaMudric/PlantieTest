// src/pages/__tests__/PopisBiljaPage.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Proizvodi from '../PopisBiljaPage.vue'; // Uvozimo komponentu (pretpostavljam da je ovo točan naziv datoteke)
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock; // Axios mock adapter
let localStorageSetItemMock; // Sada ćemo koristiti ovu varijablu za mock funkciju
let routerPushSpy; // Spy za this.$router.push

// Prije svakog testa
beforeEach(() => {
  // Potpuno resetiramo sve Vitest mockove
  vi.restoreAllMocks();
  // Kreiramo novu instancu MockAdaptera za Axios
  mock = new MockAdapter(axios);
  // Aktiviramo lažne tajmere
  vi.useFakeTimers();

  // Kreiramo mock funkciju za localStorage.setItem
  localStorageSetItemMock = vi.fn();
  // Kreiramo spy za router.push
  routerPushSpy = vi.fn();
});

// Opisujemo grupu testova za komponentu PopisBiljaPage (ime opisno za test datoteku)
describe('PopisBiljaPage.vue', () => {
  // Pomoćna funkcija za montiranje komponente s mockanim Quasar komponentama
  const mountComponentWithQuasar = (options = {}) => {
    return mount(Proizvodi, { // Ime komponente ostaje Proizvodi kako je u vašem .vue fajlu
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-btn': {
            props: ['label', 'color'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase()">{{ label }}</button>`,
          },
          // Mock za img tag
          'img': {
            props: ['src', 'alt'],
            template: `<img :src="src" :alt="alt" />`
          }
        },
        // KLJUČNA PROMJENA: Mockiramo globalne objekte i funkcije
        mocks: {
          $router: {
            push: routerPushSpy,
          },
          // Direktno mockiramo localStorage.setItem
          // Ovo osigurava da se komponenta poziva naš mock, a ne originalni localStorage
          localStorage: {
            setItem: localStorageSetItemMock,
          },
        },
      },
      ...options,
    });
  };

  const mockProductsData = [
    { sifraBiljke: 1, nazivBiljke: 'Ruža', opisBiljke: 'Crvena ruža', cijena: 5.99, slikaBiljke: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Ruza' },
    { sifraBiljke: 2, nazivBiljke: 'Tulipan', opisBiljke: 'Žuti tulipan', cijena: 3.50, slikaBiljke: 'https://placehold.co/100x100/B0B0B0/FFFFFF?text=Tulipan' },
  ];

  // Test 1: Provjerava dohvaćanje proizvoda prilikom montiranja komponente
  it('treba dohvatiti proizvode prilikom montiranja komponente', async () => {
    // Mockiramo uspješan GET zahtjev
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockProductsData);

    const wrapper = mountComponentWithQuasar();
    await flushPromises(); // Čekamo da se axios.get riješi
    await wrapper.vm.$nextTick(); // Čekamo DOM update

    // Provjeravamo da li su podaci ispravno postavljeni u 'products'
    expect(wrapper.vm.products).toEqual(mockProductsData);
    // Provjeravamo da li se prikazuje ispravan broj kartica proizvoda
    expect(wrapper.findAll('.product-card').length).toBe(mockProductsData.length);
    // Provjeravamo sadržaj prve kartice
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('Ruža');
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('Crvena ruža');
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('5.99 €');
  });

  // Test 2: Provjerava rukovanje greškom prilikom dohvaćanja proizvoda
  it('treba logirati grešku ako dohvaćanje proizvoda ne uspije', async () => {
    // Mockiramo neuspješan GET zahtjev
    mock.onGet('http://localhost:3000/api/biljke').reply(500);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises(); // Čekamo da se axios.get (koji će propasti) riješi
    await wrapper.vm.$nextTick(); // Čekamo DOM update

    // Provjeravamo da li je 'products' i dalje prazan
    expect(wrapper.vm.products).toEqual([]);
    // Provjeravamo da li je greška logirana u konzoli
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Provjeravamo da nema prikazanih kartica proizvoda
    expect(wrapper.findAll('.product-card').length).toBe(0);

    consoleErrorSpy.mockRestore(); // Vraćamo console.error na originalno stanje
  });

});
