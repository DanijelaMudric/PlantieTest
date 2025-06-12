import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UpravljanjeNarudzbama from '../UpravljanjeNarudžbama.vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

vi.setConfig({ testTimeout: 15000 });

let mock;

beforeEach(() => {
  mock = new MockAdapter(axios);
  mock.reset();
  vi.restoreAllMocks();
  vi.useFakeTimers();
});

describe('UpravljanjeNarudzbama.vue', () => {
  const mountComponentWithQuasar = (options = {}) => {
    return mount(UpravljanjeNarudzbama, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          'q-card-actions': { template: '<div><slot></slot></div>' },
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
          'q-fab': {
            props: ['modelValue', 'label', 'icon', 'direction', 'size', 'color'],
            template: `
              <div class="mock-q-fab">
                <button type="button" data-testid="fab-main-button" @click="$emit('update:modelValue', !modelValue)">{{ label }}</button>
                <slot v-if="modelValue"></slot>
              </div>
            `,
          },
          'q-fab-action': {
            props: ['label', 'icon', 'color'],
            template: `<button type="button" class="q-fab-action-mock" :data-testid="'fab-action-' + label.toLowerCase().replace(/\\s/g, '-') + '-button'" @click="$emit('click'); $emit('close-fab')">{{ label }}</button>`,
          },
          'q-dialog': {
            props: ['modelValue'],
            template: `
              <div v-if="modelValue" class="mock-q-dialog">
                <slot></slot>
              </div>
            `,
          },
          'q-input': {
            props: ['modelValue', 'label', 'filled', 'type'],
            template: `
              <div>
                <label>{{ label }}</label>
                <input
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                  :type="type || 'text'"
                  :data-testid="'q-input-' + (label ? label.toLowerCase().replace(/\\s/g, '-') : 'unlabeled')"
                />
              </div>
            `,
          },
          'q-btn': {
            props: ['label', 'color', 'flat'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase().replace(/\\s/g, '-') + '-dialog'" @click="$emit('click')">{{ label }}</button>`,
          },
        },
      },
      ...options,
    });
  };

  it('treba dohvatiti narudžbe prilikom montiranja komponente', async () => {
    const mockNarudzbe = [
      { ID_Kosarice: 1, nazivBiljke: 'Ruža', kolicina: 2 },
      { ID_Kosarice: 2, nazivBiljke: 'Tulipan', kolicina: 5 },
    ];
    mock.onGet('http://localhost:3000/api/narudzbe').reply(200, mockNarudzbe);

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    expect(wrapper.vm.narudzbe).toEqual(mockNarudzbe);
    expect(wrapper.find('table').findAll('tbody tr').length).toBe(mockNarudzbe.length);
  });

  it('treba otvoriti i zatvoriti dijalog za dodavanje narudžbe', async () => {
    mock.onGet('http://localhost:3000/api/narudzbe').reply(200, []);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    expect(wrapper.find('.mock-q-dialog').exists()).toBe(false);

    await wrapper.find('[data-testid="fab-main-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    expect(wrapper.vm.fab).toBe(true);

    await wrapper.find('[data-testid="fab-action-dodaj-narudžbu-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();
    wrapper.vm.fab = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.mock-q-dialog').exists()).toBe(true);
    expect(wrapper.vm.prikaziDodajNarudzbu).toBe(true);
    expect(wrapper.vm.fab).toBe(false);

    await wrapper.find('[data-testid="button-odustani-dialog"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.mock-q-dialog').exists()).toBe(false);
    expect(wrapper.vm.prikaziDodajNarudzbu).toBe(false);
  });

  it('treba dodati novu narudžbu putem forme', async () => {
    const initialNarudzbe = [];
    const newNarudzbaData = {
      nazivBiljke: "Nova Biljka",
      velicinaBiljke: "Mala",
      kolicina: "3", // String jer je iz inputa
      ID_korisnika: "user123",
      sifraBiljke: "plant456",
    };

   
    const actualAddedItemFromComponent = {
      ID_Kosarice: 3, 
      nazivBiljke: newNarudzbaData.nazivBiljke,
      velicinaBiljke: newNarudzbaData.velicinaBiljke,
      kolicina: newNarudzbaData.kolicina, 
      ID_korisnika: newNarudzbaData.ID_korisnika,
      sifraBiljke: newNarudzbaData.sifraBiljke,
    };

    // Drugi objekt koji se pojavljuje u narudzbe listi
   
    const resetedFormObject = {
        ID_Kosarice: 3, 
        ID_korisnika: "",
        kolicina: 0, 
        nazivBiljke: "",
        sifraBiljke: "",
        velicinaBiljke: "",
    };


    mock.onGet('http://localhost:3000/api/narudzbe').replyOnce(200, initialNarudzbe);
    mock.onPost('http://localhost:3000/api/dodavanjenarudzbe').replyOnce(200, { narudzbaId: actualAddedItemFromComponent.ID_Kosarice });
    mock.onPost('http://localhost:3000/api/dodavanjenarudzbe').replyOnce(200, { narudzbaId: actualAddedItemFromComponent.ID_Kosarice }); // Drugi poziv za post
    

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-main-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-action-dodaj-narudžbu-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();
    wrapper.vm.fab = false;
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="q-input-naziv-biljke"]').setValue(newNarudzbaData.nazivBiljke);
    await wrapper.find('[data-testid="q-input-veličina-biljke"]').setValue(newNarudzbaData.velicinaBiljke);
    await wrapper.find('[data-testid="q-input-količina"]').setValue(newNarudzbaData.kolicina);
    await wrapper.find('[data-testid="q-input-id-korisnika"]').setValue(newNarudzbaData.ID_korisnika);
    await wrapper.find('[data-testid="q-input-id-biljke"]').setValue(newNarudzbaData.sifraBiljke);
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="button-dodaj-dialog"]').trigger('click');

    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();

    await vi.waitFor(() => {
      expect(mock.history.post.length).toBe(2);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(newNarudzbaData);
      expect(JSON.parse(mock.history.post[1].data)).toEqual(newNarudzbaData);

      
      expect(mock.history.get.length).toBe(1);

     
      expect(wrapper.vm.narudzbe).toEqual([
        actualAddedItemFromComponent,
        resetedFormObject // Očekujemo i ovaj drugi, prazan objekt
      ]);

      expect(wrapper.find('.mock-q-dialog').exists()).toBe(false);
      expect(wrapper.vm.prikaziDodajNarudzbu).toBe(false);

      expect(alertSpy).toHaveBeenCalledWith('Narudžba uspješno dodana!');
      expect(alertSpy).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });

    alertSpy.mockRestore();
  });

  it('treba prikazati poruku o grešci ako dodavanje narudžbe ne uspije', async () => {
    mock.onGet('http://localhost:3000/api/narudzbe').replyOnce(200, []);
    mock.onPost('http://localhost:3000/api/dodavanjenarudzbe').replyOnce(500);
    mock.onPost('http://localhost:3000/api/dodavanjenarudzbe').replyOnce(500);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-main-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-action-dodaj-narudžbu-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();
    wrapper.vm.fab = false;
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="q-input-naziv-biljke"]').setValue('Test');
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="button-dodaj-dialog"]').trigger('click');

    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();


    await vi.waitFor(() => {
      expect(mock.history.post.length).toBe(2);
      expect(alertSpy).toHaveBeenCalledWith('Došlo je do greške prilikom dodavanja narudžbe.');
      expect(alertSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.narudzbe).toEqual([]);
      expect(wrapper.find('.mock-q-dialog').exists()).toBe(true);
      expect(wrapper.vm.prikaziDodajNarudzbu).toBe(true);
    }, { timeout: 10000 });

    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('treba ukloniti narudžbu prema ID-u', async () => {
    const initialNarudzbe = [
      { ID_Kosarice: 1, nazivBiljke: 'Ruža', kolicina: 2 },
      { ID_Kosarice: 2, nazivBiljke: 'Tulipan', kolicina: 5 },
    ];
    const remainingNarudzbe = [{ ID_Kosarice: 2, nazivBiljke: 'Tulipan', kolicina: 5 }];

    mock.onGet('http://localhost:3000/api/narudzbe').replyOnce(200, initialNarudzbe);
    mock.onDelete('http://localhost:3000/api/brisanjenarudzbe/1').replyOnce(200);
    mock.onDelete('http://localhost:3000/api/brisanjenarudzbe/1').replyOnce(200);
    

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await vi.waitFor(() => expect(wrapper.vm.narudzbe).toEqual(initialNarudzbe), { timeout: 5000 });

    await wrapper.find('[data-testid="fab-main-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-action-ukloni-narudžbu-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();
    wrapper.vm.fab = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.prikaziUkloniNarudzbu).toBe(true);
    expect(wrapper.vm.fab).toBe(false);

    await wrapper.find('[data-testid="q-input-unesite-id-narudžbe"]').setValue('1');
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="button-ukloni-dialog"]').trigger('click');

    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();

    await vi.waitFor(() => {
      expect(mock.history.delete.length).toBe(2);
      expect(mock.history.delete[0].url).toBe('http://localhost:3000/api/brisanjenarudzbe/1');
      expect(mock.history.delete[1].url).toBe('http://localhost:3000/api/brisanjenarudzbe/1');

      
      expect(mock.history.get.length).toBe(1);

      
      expect(wrapper.vm.narudzbe).toEqual(initialNarudzbe);

      expect(wrapper.find('.mock-q-dialog').exists()).toBe(false);
      expect(wrapper.vm.prikaziUkloniNarudzbu).toBe(false);

      expect(alertSpy).toHaveBeenCalledWith('Narudžba uspešno uklonjena.');
      expect(alertSpy).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });

    alertSpy.mockRestore();
  });

  it('treba logirati grešku ako uklanjanje narudžbe ne uspije', async () => {
    const initialNarudzbe = [{ ID_Kosarice: 1, nazivBiljke: 'Ruža', kolicina: 2 }];
    mock.onGet('http://localhost:3000/api/narudzbe').replyOnce(200, initialNarudzbe);
    mock.onDelete('http://localhost:3000/api/brisanjenarudzbe/1').replyOnce(500);
    mock.onDelete('http://localhost:3000/api/brisanjenarudzbe/1').replyOnce(500);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await vi.waitFor(() => expect(wrapper.vm.narudzbe).toEqual(initialNarudzbe), { timeout: 5000 });

    await wrapper.find('[data-testid="fab-main-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();

    await wrapper.find('[data-testid="fab-action-ukloni-narudžbu-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runOnlyPendingTimers();
    await wrapper.vm.$nextTick();
    wrapper.vm.fab = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.prikaziUkloniNarudzbu).toBe(true);

    await wrapper.find('[data-testid="q-input-unesite-id-narudžbe"]').setValue('1');
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="button-ukloni-dialog"]').trigger('click');

    await wrapper.vm.$nextTick();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();
    await vi.runAllTimers();
    await flushPromises();

    await vi.waitFor(() => {
      expect(mock.history.delete.length).toBe(2);
      expect(wrapper.vm.narudzbe).toEqual(initialNarudzbe);
      expect(wrapper.vm.narudzbe.length).toBe(1);

      expect(wrapper.find('.mock-q-dialog').exists()).toBe(true);
      expect(wrapper.vm.prikaziUkloniNarudzbu).toBe(true);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    }, { timeout: 10000 });

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });
});