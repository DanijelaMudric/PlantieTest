import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpravljanjeObjavama from '../UpravljanjeObjavama.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;

beforeEach(() => {
  mock = new MockAdapter(axios);
  mock.reset();
  vi.restoreAllMocks();
  vi.useFakeTimers();
});

describe('UpravljanjeObjavama.vue', () => {
  const mountComponentWithQuasar = (options = {}) => {
    return mount(UpravljanjeObjavama, {
      global: {
        components: {
          'q-page': {
            template: '<div><slot></slot></div>',
          },
          'q-table': {
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
            props: ['modelValue', 'label', 'filled'],
            template: `
              <div>
                <label>{{ label }}</label>
                <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
              </div>
            `,
          },
          'q-btn': {
            props: ['label', 'color'],
            template: `<button @click="$emit('click')">{{ label }}</button>`,
          },
          'q-spinner': {
            template: `<div></div>`,
          },
        },
      },
      ...options,
    });
  };

  it('treba dohvatiti zahtjeve prilikom montiranja komponente', async () => {
    const mockZahtjevi = [
      { ID_Zahtjeva: 1, Zahtjev: 'Komentar 1' },
      { ID_Zahtjeva: 2, Zahtjev: 'Komentar 2' },
    ];

    mock.onGet('http://localhost:3000/api/zahtjevi').reply(200, mockZahtjevi);

    const wrapper = mountComponentWithQuasar();

    await wrapper.vm.$nextTick();
    await vi.waitFor(() => {
      expect(wrapper.findComponent({ name: 'q-spinner' }).exists()).toBe(false);
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.zahtjevi).toEqual(mockZahtjevi);
      expect(wrapper.find('table').findAll('tbody tr').length).toBe(mockZahtjevi.length);
    });
  });
});
