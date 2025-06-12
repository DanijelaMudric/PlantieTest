// src/pages/__tests__/UpravljanjeKorisnicima.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpravljanjeKorisnicima from '../UpravljanjeKorisnicima.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;
let consoleErrorSpy;
let consoleLogSpy;

beforeEach(() => {
  vi.restoreAllMocks();
  mock = new MockAdapter(axios);
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('UpravljanjeKorisnicima.vue', () => {
  const mountComponentWithQuasar = (options = {}) => {
    return mount(UpravljanjeKorisnicima, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-table': {
            template: `
              <div data-testid="q-table-mock">
                <div v-if="rows && rows.length">
                  <div v-for="row in rows" :key="row.ID_korisnika" :data-korisnik-id="row.ID_korisnika">
                    <span>{{ row.Ime_korisnika }} {{ row.Prezime_korisnika }}</span>
                    <span> - {{ row.Email_korisnika }}</span>
                  </div>
                </div>
                <div v-else>Nema podataka za prikaz.</div>
              </div>
            `,
            props: ['rows', 'columns', 'rowKey'],
          },
          'q-fab': { template: '<div><slot></slot></div>', props: ['modelValue'] },
          'q-fab-action': { template: '<button><slot></slot></button>', props: ['label'] },
          'q-dialog': { template: '<div v-if="modelValue"><slot></slot></div>', props: ['modelValue'] },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-input': { template: '<div></div>', props: ['modelValue', 'label'] },
          'q-btn': { template: '<button><slot></slot></button>', props: ['label'] },
          'q-card-actions': { template: '<div><slot></slot></div>' },
        },
      },
      ...options,
    });
  };

  const mockUsers = [
    {
      ID_korisnika: 1,
      Ime_korisnika: 'Pero',
      Prezime_korisnika: 'Peric',
      Email_korisnika: 'pero@example.com',
      Lozinka_korisnika: 'pass123',
      Adresa_korisnika: 'Ulica 1',
      Kontakt_korisnika: '111-222',
    },
    {
      ID_korisnika: 2,
      Ime_korisnika: 'Ana',
      Prezime_korisnika: 'Anic',
      Email_korisnika: 'ana@example.com',
      Lozinka_korisnika: 'pass456',
      Adresa_korisnika: 'Ulica 2',
      Kontakt_korisnika: '333-444',
    },
  ];

  it('treba dohvatiti korisnike i prikazati ih u tablici prilikom montiranja', async () => {
    mock.onGet('http://localhost:3000/api/korisnici').reply(200, mockUsers);

    const wrapper = mountComponentWithQuasar();

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.korisnici).toEqual(mockUsers);

    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toBe('http://localhost:3000/api/korisnici');

    expect(wrapper.find('[data-korisnik-id="1"]').exists()).toBe(true);
    expect(wrapper.find('[data-korisnik-id="1"]').text()).toContain('Pero Peric - pero@example.com');

    expect(wrapper.find('[data-korisnik-id="2"]').exists()).toBe(true);
    expect(wrapper.find('[data-korisnik-id="2"]').text()).toContain('Ana Anic - ana@example.com');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('treba logirati grešku ako dohvaćanje korisnika ne uspije', async () => {
    mock.onGet('http://localhost:3000/api/korisnici').reply(500);

    const wrapper = mountComponentWithQuasar();

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.korisnici).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Greška prilikom dohvaćanja korisnika:",
      expect.any(Object)
    );
  });
});