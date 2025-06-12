// src/pages/__tests__/NarudzbaPage.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NarudzbaPage from '../NarudzbaPage.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';


let mock;
let routerPushSpy;
let consoleErrorSpy;


beforeEach(() => {
  vi.restoreAllMocks(); 
  routerPushSpy = vi.fn(); 
  mock = new MockAdapter(axios); 
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); 

  
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    configurable: true,
    value: {
      getItem: vi.fn(() => null), 
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
    },
  });
});


describe('NarudzbaPage.vue', () => {
 
  const mountComponentWithQuasar = (options = {}) => {
    return mount(NarudzbaPage, {
      global: {
        components: {
         
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-form': { template: '<div><slot></slot></div>' }, 
          'q-input': { template: '<div></div>', props: ['modelValue', 'label'] }, 
          'q-btn': { template: '<button></button>', props: ['label'] },
          'q-banner': { template: '<div></div>', props: ['modelValue'] },
        },
        mocks: {
          $route: {
            params: {
              nazivBiljke: 'TestBiljka', 
            },
          },
          $router: {
            push: routerPushSpy, 
          },
        },
      },
      ...options,
    });
  };

  const mockProductData = {
    sifraBiljke: 1,
    nazivBiljke: 'TestBiljka',
    vrstaBiljke: 'Cvjetnica',
    opisBiljke: 'Testni opis',
    cijena: 10.00,
  };

  // Provjera dohvaćanja podataka o biljci 
  
  it.only('treba dohvatiti i prikazati podatke o biljci prilikom montiranja', async () => {
    
    mock.onGet('http://localhost:3000/api/biljke/TestBiljka').reply(200, mockProductData);

    
    const wrapper = mountComponentWithQuasar();

    
    await flushPromises();
    await wrapper.vm.$nextTick(); 

   
    expect(wrapper.vm.product).toEqual(mockProductData);

    
    expect(wrapper.text()).toContain('Narudžba za biljku: TestBiljka');

    
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});