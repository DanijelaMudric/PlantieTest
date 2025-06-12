import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import UpravljanjeKorisnicima from '../UpravljanjeKorisnicima.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;

beforeEach(() => {
  mock = new MockAdapter(axios);
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
    },
    {
      ID_korisnika: 2,
      Ime_korisnika: 'Ana',
      Prezime_korisnika: 'Anic',
      Email_korisnika: 'ana@example.com',
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
  });

  it('treba ostaviti korisnike praznima ako dohvaćanje ne uspije', async () => {
    mock.onGet('http://localhost:3000/api/korisnici').reply(500);

    const wrapper = mountComponentWithQuasar();

    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.korisnici).toEqual([]);
  });
});
