// src/pages/__tests__/Registracija.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Registracija from '../RegistracijaPage.vue'; // Uvozimo komponentu Registracija
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;

// Prije svakog testa
beforeEach(() => {
  // Potpuno resetiramo sve Vitest mockove
  vi.restoreAllMocks();
  // Kreiramo novu instancu MockAdaptera za Axios za svaki test
  mock = new MockAdapter(axios);
  // Aktiviramo lažne tajmere
  vi.useFakeTimers();
});

// Opisujemo grupu testova za komponentu Registracija
describe('Registracija.vue', () => {
  // Pomoćna funkcija za montiranje komponente s mockanim Quasar komponentama
  const mountComponentWithQuasar = (options = {}) => {
    return mount(Registracija, {
      global: {
        components: {
          // Jednostavni div za q-page i h1
          'q-page': { template: '<div><slot></slot></div>' },
          // Mock za q-input (Ulazno polje)
          'q-input': {
            props: ['modelValue', 'label', 'filled', 'type'],
            template: `
              <div>
                <label>{{ label }}</label>
                <!-- Simuliramo input polje koje emitira update:modelValue događaj -->
                <input
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                  :type="type || 'text'"
                  :data-testid="'input-' + label.toLowerCase().replace(/\\s/g, '-')"/>
              </div>
            `,
          },
          // Mock za q-btn (Gumb)
          'q-btn': {
            props: ['label', 'color'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase().replace(/\\s/g, '-')">{{ label }}</button>`,
          },
        },
      },
      ...options,
    });
  };

  // Test 1: Provjerava da li se pojavljuje upozorenje ako nisu popunjena sva polja
  it('treba prikazati upozorenje ako nisu popunjena sva polja', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Polja su inicijalno prazna, klik na gumb "Potvrdi"
    await wrapper.find('[data-testid="button-potvrdi"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Očekujemo alert poruku
    expect(alertSpy).toHaveBeenCalledWith('Molimo ispunite sva polja.');
    // Ne očekujemo Axios POST poziv
    expect(mock.history.post.length).toBe(0);

    alertSpy.mockRestore(); // Vraćamo alert na originalno stanje
  });

  // Test 2: Provjerava uspješnu registraciju korisnika
  it('treba uspješno registrirati korisnika kada su svi podaci uneseni', async () => {
    const mockUserData = {
      ime: 'TestIme',
      prezime: 'TestPrezime',
      email: 'test@example.com',
      lozinka: 'password123',
      adresa: 'Test Adresa 123',
      telefon: '0987654321',
    };
    const mockSuccessResponse = { message: 'Korisnik uspješno registriran!' };

    // Mockiramo uspješan POST zahtjev
    mock.onPost('http://localhost:3000/api/Korisnik').reply(200, mockSuccessResponse);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Špijuniramo console.error

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Popunjavanje svih polja
    await wrapper.find('[data-testid="input-ime"]').setValue(mockUserData.ime);
    await wrapper.find('[data-testid="input-prezime"]').setValue(mockUserData.prezime);
    await wrapper.find('[data-testid="input-email"]').setValue(mockUserData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserData.lozinka);
    await wrapper.find('[data-testid="input-adresa"]').setValue(mockUserData.adresa);
    await wrapper.find('[data-testid="input-telefon"]').setValue(mockUserData.telefon);

    // Očistimo povijest Axios poziva prije klika
    mock.resetHistory();

    // Klik na gumb "Potvrdi"
    await wrapper.find('[data-testid="button-potvrdi"]').trigger('click');
    await flushPromises(); // Čekamo da se POST request razriješi
    await wrapper.vm.$nextTick();

    await vi.waitFor(() => {
      // Očekujemo točno jedan POST poziv
      expect(mock.history.post.length).toBe(1);
      // Provjeravamo da li su podaci poslani ispravni
      expect(JSON.parse(mock.history.post[0].data)).toEqual(mockUserData);
      // Očekujemo alert s uspješnom porukom
      expect(alertSpy).toHaveBeenCalledWith(mockSuccessResponse.message);
      // Ne očekujemo greške u konzoli
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test 3: Provjerava rukovanje greškom prilikom registracije korisnika
  it('treba prikazati poruku o grešci i logirati grešku ako registracija ne uspije', async () => {
    const mockUserData = {
      ime: 'TestIme',
      prezime: 'TestPrezime',
      email: 'test@example.com',
      lozinka: 'password123',
      adresa: 'Test Adresa 123',
      telefon: '0987654321',
    };
    const mockErrorResponse = { error: 'Email je već zauzet.' };

    // Mockiramo neuspješan POST zahtjev
    mock.onPost('http://localhost:3000/api/Korisnik').reply(400, mockErrorResponse);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Popunjavanje svih polja
    await wrapper.find('[data-testid="input-ime"]').setValue(mockUserData.ime);
    await wrapper.find('[data-testid="input-prezime"]').setValue(mockUserData.prezime);
    await wrapper.find('[data-testid="input-email"]').setValue(mockUserData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserData.lozinka);
    await wrapper.find('[data-testid="input-adresa"]').setValue(mockUserData.adresa);
    await wrapper.find('[data-testid="input-telefon"]').setValue(mockUserData.telefon);

    // Očistimo povijest Axios poziva prije klika
    mock.resetHistory();

    // Klik na gumb "Potvrdi"
    await wrapper.find('[data-testid="button-potvrdi"]').trigger('click');
    await flushPromises(); // Čekamo da se POST request razriješi
    await wrapper.vm.$nextTick();

    await vi.waitFor(() => {
      // Očekujemo točno jedan POST poziv
      expect(mock.history.post.length).toBe(1);
      // Provjeravamo da li su podaci poslani ispravni
      expect(JSON.parse(mock.history.post[0].data)).toEqual(mockUserData);
      // Očekujemo alert s porukom o grešci
      expect(alertSpy).toHaveBeenCalledWith(mockErrorResponse.error);
      // Očekujemo da je greška logirana u konzoli
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test 4: Provjerava rukovanje generičkom greškom prilikom registracije (nema response.data.error)
  it('treba prikazati generičku poruku o grešci ako registracija ne uspije bez specifične poruke', async () => {
    const mockUserData = {
      ime: 'TestIme',
      prezime: 'TestPrezime',
      email: 'test@example.com',
      lozinka: 'password123',
      adresa: 'Test Adresa 123',
      telefon: '0987654321',
    };

    // Mockiramo neuspješan POST zahtjev bez specifične poruke o grešci
    mock.onPost('http://localhost:3000/api/Korisnik').reply(500, {}); // Prazan error response

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Popunjavanje svih polja
    await wrapper.find('[data-testid="input-ime"]').setValue(mockUserData.ime);
    await wrapper.find('[data-testid="input-prezime"]').setValue(mockUserData.prezime);
    await wrapper.find('[data-testid="input-email"]').setValue(mockUserData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserData.lozinka);
    await wrapper.find('[data-testid="input-adresa"]').setValue(mockUserData.adresa);
    await wrapper.find('[data-testid="input-telefon"]').setValue(mockUserData.telefon);

    // Očistimo povijest Axios poziva prije klika
    mock.resetHistory();

    // Klik na gumb "Potvrdi"
    await wrapper.find('[data-testid="button-potvrdi"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    await vi.waitFor(() => {
      // Očekujemo točno jedan POST poziv
      expect(mock.history.post.length).toBe(1);
      // Očekujemo generičku poruku o grešci
      expect(alertSpy).toHaveBeenCalledWith('Došlo je do greške pri registraciji.');
      // Očekujemo da je greška logirana u konzoli
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
