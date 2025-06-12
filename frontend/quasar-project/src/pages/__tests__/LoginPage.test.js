// src/pages/__tests__/LoginPage.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '../LoginPage.vue'; 
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';


let routerPushSpy = vi.fn();


vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal(); 
  return {
    ...actual, 
    useRouter: () => ({ 
      push: routerPushSpy, 
    }),
  };
});



let mock; 
let localStorageSetItemSpy; 
let localStorageRemoveItemSpy; 
let localStorageGetItemSpy; 
let alertSpy; 
let consoleErrorSpy; 
let consoleLogSpy; 
let windowLocationReloadSpy; 


beforeEach(() => {
  
  vi.restoreAllMocks(); 
                       
                       
  routerPushSpy = vi.fn(); 

  
  routerPushSpy.mockClear(); 
  routerPushSpy.mockRestore(); 
  routerPushSpy = vi.fn(); 

  
  mock = new MockAdapter(axios);
  
  vi.useFakeTimers();

  
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    configurable: true, 
    value: {
      getItem: vi.fn((key) => {
        if (key === 'user') { 
          return localStorageGetItemSpy.mock.results.some(r => r.type === 'return' && r.value !== null)
            ? localStorageGetItemSpy.mock.results.find(r => r.type === 'return' && r.value !== null).value
            : null;
        }
        return null; 
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
    },
  });
  localStorageGetItemSpy = vi.spyOn(window.localStorage, 'getItem');
  localStorageSetItemSpy = vi.spyOn(window.localStorage, 'setItem');
  localStorageRemoveItemSpy = vi.spyOn(window.localStorage, 'removeItem');

  
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...window.location,
      reload: vi.fn(),
    },
  });
  windowLocationReloadSpy = vi.spyOn(window.location, 'reload');

 
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
 
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});


describe('LoginPage.vue', () => {
 
  const mountComponentWithQuasar = (options = {}) => {
    return mount(LoginPage, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-input': {
            props: ['modelValue', 'label', 'filled', 'type', 'rules'],
            template: `
              <div>
                <label>{{ label }}</label>
                <input
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                  :type="type || 'text'"
                  :data-testid="'input-' + label.toLowerCase().replace(/\\s/g, '-')"/>
              </div>
            `,
          },
          'q-btn': {
            props: ['label', 'color', 'class'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase().replace(/\\s/g, '-')">{{ label }}</button>`,
          },
        },
        
        mocks: {
          $router: {
            push: routerPushSpy, 
          },
        },
      },
      ...options,
    });
  };

  // Test 1: Uspješna prijava korisnika
  it('treba omogućiti uspješnu prijavu korisnika', async () => {
    const mockUserLoginData = { email: 'user@example.com', password: 'password123' };
    const mockBackendResponse = {
      message: 'Uspješna prijava',
      korisnik: {
        ID_korisnika: 1,
        Ime_korisnika: 'Test',
        Prezime_korisnika: 'User',
        Email_korisnika: 'user@example.com'
      }
    };
    mock.onPost('http://localhost:3000/api/prijava').reply(200, mockBackendResponse);

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    // Popunjavanje forme
    await wrapper.find('[data-testid="input-email"]').setValue(mockUserLoginData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserLoginData.password);

    
    mock.resetHistory();

    // Klik na gumb za prijavu
    await wrapper.find('[data-testid="button-prijava"]').trigger('click');
    await flushPromises(); 
    await wrapper.vm.$nextTick();

    
    expect(mock.history.post.length).toBe(1);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      Email_korisnika: mockUserLoginData.email,
      Lozinka_korisnika: mockUserLoginData.password,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Uspješna prijava');
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('user', JSON.stringify(mockBackendResponse.korisnik));
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('Ime_korisnika', mockBackendResponse.korisnik.Ime_korisnika);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('ID_korisnika', mockBackendResponse.korisnik.ID_korisnika);
    expect(alertSpy).toHaveBeenCalledWith('Prijava uspješna!');
    expect(routerPushSpy).toHaveBeenCalledWith('/'); 
  });

  // Test 2: Prijava korisnika s praznim poljima
  it('treba prikazati upozorenje ako korisnik pokuša prijavu s praznim poljima', async () => {
    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    // Klik na gumb za prijavu bez popunjavanja polja
    await wrapper.find('[data-testid="button-prijava"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(alertSpy).toHaveBeenCalledWith('Sva polja su obavezna.');
    expect(mock.history.post.length).toBe(0); 
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(routerPushSpy).not.toHaveBeenCalled();
  });

  // Test 3: Neuspješna prijava korisnika (API greška)
  it('treba rukovati greškom prilikom prijave korisnika', async () => {
    const mockUserLoginData = { email: 'user@example.com', password: 'password123' };
    mock.onPost('http://localhost:3000/api/prijava').reply(401, { error: 'Pogrešna lozinka ili email.' });

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="input-email"]').setValue(mockUserLoginData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserLoginData.password);

    mock.resetHistory(); 

    await wrapper.find('[data-testid="button-prijava"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(mock.history.post.length).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Greška prilikom prijave.');
    expect(localStorageSetItemSpy).not.toHaveBeenCalled();
    expect(routerPushSpy).not.toHaveBeenCalled();
  });

  // Test 4: Uspješna prijava admina
  it('treba omogućiti uspješnu prijavu admina', async () => {
    const mockAdminId = 'admin123';
    mock.onGet('http://localhost:3000/Admin').reply(200, [{ id_exists: 1 }]);

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    
    await wrapper.find('[data-testid="input-admin-id"]').setValue(mockAdminId);

    mock.resetHistory(); 

    await wrapper.find('[data-testid="button-prijava-kao-admin"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].params).toEqual({ adminId: mockAdminId });
    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'AdminPage' });
    expect(alertSpy).not.toHaveBeenCalled(); 
  });

  // Test 5: Prijava admina s praznim ID-om
  it('treba prikazati upozorenje ako admin pokuša prijavu s praznim ID-om', async () => {
    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    // Klik na gumb za prijavu admina bez unosa ID-a
    await wrapper.find('[data-testid="button-prijava-kao-admin"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(alertSpy).toHaveBeenCalledWith('Molimo unesite ID admina.');
    expect(mock.history.get.length).toBe(0); 
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(routerPushSpy).not.toHaveBeenCalled();
  });

  // Test 6: Neuspješna prijava admina (neispravan ID)
  it('treba prikazati upozorenje za neispravan ID admina', async () => {
    const mockAdminId = 'invalidAdmin';
    mock.onGet('http://localhost:3000/Admin').reply(200, [{ id_exists: 0 }]); 

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="input-admin-id"]').setValue(mockAdminId);

    mock.resetHistory(); 

    await wrapper.find('[data-testid="button-prijava-kao-admin"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(mock.history.get.length).toBe(1);
    expect(alertSpy).toHaveBeenCalledWith('Ne, ne! Neispravan ID admina.');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(routerPushSpy).not.toHaveBeenCalled();
  });

  // Test 7: Neuspješna prijava admina (API greška)
  it('treba rukovati greškom prilikom prijave admina', async () => {
    const mockAdminId = 'admin123';
    mock.onGet('http://localhost:3000/Admin').reply(500); // API greška

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="input-admin-id"]').setValue(mockAdminId);

    mock.resetHistory(); 

    await wrapper.find('[data-testid="button-prijava-kao-admin"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(mock.history.get.length).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Došlo je do greške pri prijavi.');
    expect(routerPushSpy).not.toHaveBeenCalled();
  });

  // Test 8: Odjava korisnika
  it('treba odjaviti korisnika i resetirati formu', async () => {
    // Simuliramo da je korisnik prijavljen prije odjave
    localStorageGetItemSpy.mockReturnValueOnce(JSON.stringify({
      ID_korisnika: 1, Ime_korisnika: 'Test', Prezime_korisnika: 'User', Email_korisnika: 'user@example.com'
    }));

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick(); 

    // Klik na gumb za odjavu
    await wrapper.find('[data-testid="button-odjava"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    
    expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('user');
    expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('Ime_korisnika');
    expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('ID_korisnika');
    expect(wrapper.vm.user.email).toBe('');
    expect(wrapper.vm.user.password).toBe('');
    expect(wrapper.vm.adminId).toBe('');
    expect(alertSpy).toHaveBeenCalledWith('Odjava uspješna!');
    expect(routerPushSpy).toHaveBeenCalledWith('/login'); 
    expect(windowLocationReloadSpy).toHaveBeenCalled(); 
  });
});