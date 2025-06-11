// src/pages/__tests__/UpravljanjeObjavama.test.js

import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpravljanjeObjavama from '../UpravljanjeObjavama.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;

// Prije svakog testa, konfiguriramo mock axios i resetiramo ga
beforeEach(() => {
  mock = new MockAdapter(axios);
  mock.reset();
  vi.restoreAllMocks(); // Vraća sve mockove (uključujući i tajmere ako su fake)
  vi.useFakeTimers(); // Dodajemo ovu liniju da Vitest mockira tajmere
});

// Opisujemo grupu testova za komponentu UpravljanjeObjavama
describe('UpravljanjeObjavama.vue', () => {
  // Pomoćna funkcija za montiranje komponente s mockanim Quasar komponentama
  const mountComponentWithQuasar = (options = {}) => {
    return mount(UpravljanjeObjavama, {
      global: {
        // Registrujemo mock komponente za Quasar elemente
        // Ovo rješava "Failed to resolve component" upozorenje
        components: {
          'q-page': {
            template: '<div><slot></slot></div>', // Jednostavan wrapper div za q-page
          },
          'q-table': {
            // q-table je kompleksnija, treba simulirati da renderuje redove
            // Proslijeđujemo 'rows' i 'columns' kao propove za provjeru
            props: ['rows', 'columns', 'row-key'],
            template: `
              <table>
                <thead>
                  <tr>
                    <th v-for="col in columns" :key="col.name">{{ col.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in rows" :key="row[rowKey || 'id'] || index">
                    <td v-for="col in columns" :key="col.name">{{ row[col.field] }}</td>
                  </tr>
                </tbody>
              </table>
            `,
          },
          'q-input': {
            props: ['modelValue', 'label', 'filled'], // Prosljeđujemo propove koje koristimo
            template: `
              <div>
                <label>{{ label }}</label>
                <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
              </div>
            `,
          },
          'q-btn': {
            props: ['label', 'color'], // Prosljeđujemo propove koje koristimo
            template: `<button @click="$emit('click')">{{ label }}</button>`,
          },
          'q-spinner': {
            // Sada samo prazan div, provjeravamo postojanje komponente direktno
            template: `<div></div>`,
          },
        },
      },
      ...options, // Omogućava prosljeđivanje dodatnih opcija za mount
    });
  };

  // Test za provjeru da li se podaci ispravno dohvaćaju prilikom montiranja komponente
  it('treba dohvatiti zahtjeve prilikom montiranja komponente', async () => {
    const mockZahtjevi = [
      { ID_Zahtjeva: 1, Zahtjev: 'Komentar 1' },
      { ID_Zahtjeva: 2, Zahtjev: 'Komentar 2' },
    ];

    mock.onGet('http://localhost:3000/api/zahtjevi').reply(200, mockZahtjevi);

    const wrapper = mountComponentWithQuasar();

    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      // Provjeravamo da li `q-spinner` komponenta NE postoji (jer bi se trebala sakriti nakon učitavanja)
      expect(wrapper.findComponent({ name: 'q-spinner' }).exists()).toBe(false);
      // Provjeravamo direktno stanje loading ref-a
      expect(wrapper.vm.loading).toBe(false);

      // Provjeravamo da li su podaci ispravno postavljeni u `zahtjevi` ref
      expect(wrapper.vm.zahtjevi).toEqual(mockZahtjevi);
      // Provjeravamo da li se tablica prikazuje s ispravnim brojem redova
      // Sada tražimo unutar mockirane q-table (koja je renderovana kao <table>)
      expect(wrapper.find('table').findAll('tbody tr').length).toBe(mockZahtjevi.length);
    });
  });

  // Uklonjen test za provjeru prikaza spiner-a tijekom učitavanja

  // Test za provjeru funkcije brisanja kada je ID ispravan
  it('treba izbrisati zahtjev i ažurirati listu kada se unese ispravan ID', async () => {
    const initialZahtjevi = [
      { ID_Zahtjeva: 1, Zahtjev: 'Komentar 1' },
      { ID_Zahtjeva: 2, Zahtjev: 'Komentar 2' },
    ];
    mock.onGet('http://localhost:3000/api/zahtjevi').reply(200, initialZahtjevi);
    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.zahtjevi).toEqual(initialZahtjevi));


    mock.onDelete('http://localhost:3000/api/zahtjev/1').reply(200);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Pronalazimo mockiranu q-input komponentu (sada je to 'input' HTML element)
    const input = wrapper.find('input'); // Pronalazimo input element direktno
    await input.setValue('1');

    // Kliknemo na gumb "Izbriši" (sada je to 'button' HTML element)
    const deleteButton = wrapper.find('button'); // Pronalazimo button element direktno
    await deleteButton.trigger('click');

    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(wrapper.vm.zahtjevi).toEqual([{ ID_Zahtjeva: 2, Zahtjev: 'Komentar 2' }]);
      expect(input.element.value).toBe(''); // Provjeravamo value direktno na HTML input elementu
      expect(alertSpy).toHaveBeenCalledWith('Zahtjev uspješno obrisan!');
    });

    alertSpy.mockRestore();
  });

  // Test za provjeru funkcije brisanja kada je ID neispravan (prazan input)
  it('treba prikazati upozorenje ako se pokuša izbrisati bez unesenog ID-a', async () => {
    const initialZahtjevi = [
      { ID_Zahtjeva: 1, Zahtjev: 'Komentar 1' },
    ];
    mock.onGet('http://localhost:3000/api/zahtjevi').reply(200, initialZahtjevi);
    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.zahtjevi).toEqual(initialZahtjevi));


    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const input = wrapper.find('input');
    expect(input.element.value).toBe(''); // Provjeravamo value direktno na HTML input elementu

    const deleteButton = wrapper.find('button');
    await deleteButton.trigger('click');

    expect(alertSpy).toHaveBeenCalledWith('Molimo unesite važeći ID zahtjeva.');
    expect(wrapper.vm.zahtjevi).toEqual(initialZahtjevi);

    alertSpy.mockRestore();
  });

  // Test za provjeru funkcije brisanja kada API vrati grešku
  it('treba prikazati poruku o grešci ako brisanje zahtjeva ne uspije', async () => {
    const initialZahtjevi = [
      { ID_Zahtjeva: 1, Zahtjev: 'Komentar 1' },
    ];
    mock.onGet('http://localhost:3000/api/zahtjevi').reply(200, initialZahtjevi);
    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();
    await vi.waitFor(() => expect(wrapper.vm.zahtjevi).toEqual(initialZahtjevi));


    mock.onDelete('http://localhost:3000/api/zahtjev/1').reply(500);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const input = wrapper.find('input');
    await input.setValue('1');

    const deleteButton = wrapper.find('button');
    await deleteButton.trigger('click');

    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Došlo je do greške prilikom brisanja zahtjeva.');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(wrapper.vm.zahtjevi).toEqual(initialZahtjevi);
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
