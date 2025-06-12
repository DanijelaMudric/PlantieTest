// src/pages/__tests__/UpravljanjeBiljem.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpravljanjeBiljem from '../UpravljanjeBiljem.vue'; 
import axios from 'axios'; 

let consoleErrorSpy;

beforeEach(() => {
  vi.restoreAllMocks();
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.spyOn(axios, 'get');
  vi.spyOn(axios, 'post'); 
  vi.spyOn(axios, 'delete'); 
});

describe('UpravljanjeBiljem.vue - Ključne funkcije (Fokus na dohvat)', () => {
  const mountComponentWithQuasar = (options = {}) => {
    return mount(UpravljanjeBiljem, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-table': {
            template: `
              <div data-testid="q-table-mock">
                <div v-if="rows && rows.length">
                  <div v-for="row in rows" :key="row.sifraBiljke" :data-biljka-id="row.sifraBiljke">
                    <span>{{ row.nazivBiljke }} - {{ row.vrstaBiljke }}</span>
                  </div>
                </div>
                <div v-else>Nema podataka za prikaz.</div>
              </div>
            `,
            props: ['rows', 'columns', 'rowKey'],
          },
          
          'q-fab': { template: '<div></div>', props: ['modelValue', 'label', 'icon', 'direction', 'size'] },
          'q-fab-action': { template: '<div></div>', props: ['label', 'icon', 'color'] },
          'q-dialog': { template: '<div></div>', props: ['modelValue'] }, 
          'q-card': { template: '<div></div>' },
          'q-card-section': { template: '<div></div>' },
          'q-input': { template: '<div></div>', props: ['modelValue', 'label', 'type'] }, 
          'q-btn': { template: '<div></div>', props: ['label', 'color', 'type'] }, 
          'q-card-actions': { template: '<div></div>' },
        },
      },
      ...options,
    });
  };

  const mockBiljke = [
    {
      sifraBiljke: 101,
      nazivBiljke: 'Ruža',
      vrstaBiljke: 'Cvjetnica',
      opisBiljke: 'Crvena ruža, mirisna.',
      dostupnaKolicina: 50,
      cijena: 5.99,
    },
    {
      sifraBiljke: 102,
      nazivBiljke: 'Orhideja',
      vrstaBiljke: 'Egzotična',
      opisBiljke: 'Bijela orhideja, elegantna.',
      dostupnaKolicina: 20,
      cijena: 15.50,
    },
  ];

 

  // Test: Dohvaćanje i prikazivanje biljaka

  it('treba dohvatiti biljke i prikazati ih u tablici prilikom montiranja', async () => {
    axios.get.mockResolvedValueOnce({ data: mockBiljke });

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.biljke).toEqual(mockBiljke);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/biljke');

    expect(wrapper.find('[data-biljka-id="101"]').exists()).toBe(true);
    expect(wrapper.find('[data-biljka-id="101"]').text()).toContain('Ruža - Cvjetnica');
    expect(wrapper.find('[data-biljka-id="102"]').exists()).toBe(true);
    expect(wrapper.find('[data-biljka-id="102"]').text()).toContain('Orhideja - Egzotična');

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  

  // Test: Greška prilikom dohvaćanja biljaka

  it('treba logirati grešku ako dohvaćanje biljaka ne uspije', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.biljke).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Greška prilikom dohvaćanja biljaka:",
      expect.any(Error)
    );
  });
});