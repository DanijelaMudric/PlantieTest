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
let windowLocationReloadSpy;
beforeEach(() => {
  vi.restoreAllMocks();
  routerPushSpy = vi.fn();
  mock = new MockAdapter(axios);

  Object.defineProperty(window, 'localStorage', {
    writable: true,
    configurable: true,
    value: {
      getItem: vi.fn(),
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
    writable: true,
    value: {
      reload: vi.fn(),
    },
  });
  windowLocationReloadSpy = vi.spyOn(window.location, 'reload');
  alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
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
            `, },
          'q-btn': {
            props: ['label', 'color', 'class'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase().replace(/\\s/g, '-')">{{ label }}</button>`,
          }, },
        mocks: {
          $router: {
            push: routerPushSpy,
          }, },},
      ...options,
    });};
  // Test 1: Uspješna prijava korisnika
  it('treba omogućiti uspješnu prijavu korisnika', async () => {
    const mockUserLoginData = { email: 'user@example.com', password: 'password123' };
    const mockBackendResponse = {
      message: 'Uspješna prijava',
      korisnik: {
        ID_korisnika: 1,
        Ime_korisnika: 'Test',
        Prezime_korisnika: 'User',
        Email_korisnika: 'user@example.com',
      },
    };
    mock.onPost('http://localhost:3000/api/prijava').reply(200, mockBackendResponse);

    const wrapper = mountComponentWithQuasar();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="input-email"]').setValue(mockUserLoginData.email);
    await wrapper.find('[data-testid="input-lozinka"]').setValue(mockUserLoginData.password);

    mock.resetHistory();

    await wrapper.find('[data-testid="button-prijava"]').trigger('click');
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(mock.history.post.length).toBe(1);
    expect(JSON.parse(mock.history.post[0].data)).toEqual({
      Email_korisnika: mockUserLoginData.email,
      Lozinka_korisnika: mockUserLoginData.password,
    });
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('user', JSON.stringify(mockBackendResponse.korisnik));
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('Ime_korisnika', mockBackendResponse.korisnik.Ime_korisnika);
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('ID_korisnika', mockBackendResponse.korisnik.ID_korisnika);
    expect(alertSpy).toHaveBeenCalledWith('Prijava uspješna!');
    expect(routerPushSpy).toHaveBeenCalledWith('/');
  });

  // Test 2: Uspješna prijava admina
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
});
