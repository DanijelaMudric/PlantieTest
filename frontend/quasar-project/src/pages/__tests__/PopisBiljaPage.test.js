import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Proizvodi from '../PopisBiljaPage.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
let mock;
let localStorageSetItemMock;
let routerPushSpy;
beforeEach(() => {
  vi.restoreAllMocks();
  mock = new MockAdapter(axios);
  vi.useFakeTimers();
  localStorageSetItemMock = vi.fn();
  routerPushSpy = vi.fn();
});
describe('PopisBiljaPage.vue', () => {
  const mountComponentWithQuasar = (options = {}) => {
    return mount(Proizvodi, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-btn': {
            props: ['label', 'color'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase()">{{ label }}</button>`, },
          'img': {
            props: ['src', 'alt'],
            template: `<img :src="src" :alt="alt" />`
          }},
        mocks: {
          $router: {
            push: routerPushSpy,
          },
          localStorage: {
            setItem: localStorageSetItemMock,
          },}, },
      ...options,
    }); };
  const mockProductsData = [
    { sifraBiljke: 1, nazivBiljke: 'Ruža', opisBiljke: 'Crvena ruža', cijena: 5.99, slikaBiljke: 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=Ruza' },
    { sifraBiljke: 2, nazivBiljke: 'Tulipan', opisBiljke: 'Žuti tulipan', cijena: 3.50, slikaBiljke: 'https://placehold.co/100x100/B0B0B0/FFFFFF?text=Tulipan' },
  ];
  // Test: Provjerava dohvaćanje proizvoda prilikom montiranja komponente
  it('treba dohvatiti proizvode prilikom montiranja komponente', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockProductsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.products).toEqual(mockProductsData);
    expect(wrapper.findAll('.product-card').length).toBe(mockProductsData.length);
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('Ruža');
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('Crvena ruža');
    expect(wrapper.findAll('.product-card').at(0).text()).toContain('5.99 €');
  });

});
