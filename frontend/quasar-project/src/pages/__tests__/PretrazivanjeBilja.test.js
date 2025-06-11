// src/pages/__tests__/PretrazivanjeBilja.test.js

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PretragaBiljaka from '../PretrazivanjeBilja.vue'; // Uvozimo komponentu
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

let mock;

// Prije svakog testa, konfiguriramo mock axios i resetiramo ga
beforeEach(() => {
  vi.restoreAllMocks(); // Vraća sve Vitest mockove
  mock = new MockAdapter(axios); // Stvara novu instancu MockAdaptera
  mock.reset(); // Resetira povijest poziva
  vi.useFakeTimers(); // Aktiviramo lažne tajmere
});

// Opisujemo grupu testova za komponentu PretragaBiljaka
describe('PretragaBiljaka.vue', () => {
  // Pomoćna funkcija za montiranje komponente s mockanim Quasar komponentama
  const mountComponentWithQuasar = (options = {}) => {
    return mount(PretragaBiljaka, {
      global: {
        components: {
          'q-page': { template: '<div><slot></slot></div>' },
          'q-card': { template: '<div><slot></slot></div>' },
          'q-card-section': { template: '<div><slot></slot></div>' },
          // Mock za q-input
          'q-input': {
            props: ['modelValue', 'label', 'outlined', 'clearable', 'type'],
            template: `
              <div>
                <label>{{ label }}</label>
                <input
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                  :type="type || 'text'"
                  :data-testid="'input-' + label.toLowerCase().replace(/\\s/g, '-')"/>
                <!-- Clearable button je dio inputa, pa ga tražimo unutar inputa -->
                <!-- Ovdje je uklonjen v-if="clearable" za potrebe testiranja,
                     jer je uzrokovao Cannot call trigger on an empty DOMWrapper. -->
                <button @click="$emit('update:modelValue', '')" data-testid="clear-input-button">Clear</button>
              </div>
            `,
          },
          // Mock za q-checkbox
          'q-checkbox': {
            props: ['modelValue', 'label'],
            template: `
              <label>
                <input
                  type="checkbox"
                  :checked="modelValue"
                  @change="$emit('update:modelValue', $event.target.checked)"
                  :data-testid="'checkbox-' + label.toLowerCase().replace(/\\s/g, '-')"/>
                {{ label }}
              </label>
            `,
          },
          // Mock za q-btn
          'q-btn': {
            props: ['label', 'color', 'class'],
            template: `<button type="button" :data-testid="'button-' + label.toLowerCase()">{{ label }}</button>`,
          },
          // Mock za q-table
          'q-table': {
            props: ['rows', 'columns', 'row-key'],
            template: `
              <table data-testid="plant-table">
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
        },
      },
      ...options,
    });
  };

  const mockPlantsData = [
    { sifraBiljke: 1, nazivBiljke: 'Ruža', vrstaBiljke: 'Cvjetnica', opisBiljke: 'Crvena ruža', dostupnaKolicina: 10, cijena: 5.99 },
    { sifraBiljke: 2, nazivBiljke: 'Tulipan', vrstaBiljke: 'Lukovičasta', opisBiljke: 'Žuti tulipan', dostupnaKolicina: 20, cijena: 3.50 },
    { sifraBiljke: 3, nazivBiljke: 'Orhideja', vrstaBiljke: 'Cvjetnica', opisBiljke: 'Egzotična orhideja', dostupnaKolicina: 5, cijena: 25.00 },
    { sifraBiljke: 4, nazivBiljke: 'Fikus', vrstaBiljke: 'Sobna biljka', opisBiljke: 'Veliki fikus', dostupnaKolicina: 8, cijena: 18.75 },
    { sifraBiljke: 5, nazivBiljke: 'Kaktus', vrstaBiljke: 'Sukulent', opisBiljke: 'Mali kaktus', dostupnaKolicina: 30, cijena: 2.00 },
  ];

  // Test 1: Treba dohvatiti sve biljke prilikom montiranja komponente
  it('treba dohvatiti sve biljke prilikom montiranja komponente', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);

    const wrapper = mountComponentWithQuasar();
    await flushPromises(); // Čekamo da se axios.get riješi
    await wrapper.vm.$nextTick(); // Čekamo DOM update

    expect(wrapper.vm.allPlants).toEqual(mockPlantsData);
    expect(wrapper.vm.filteredPlants).toEqual(mockPlantsData);
    expect(wrapper.find('[data-testid="plant-table"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(mockPlantsData.length);
  });

  // Test 2: Treba prikazati poruku o grešci ako dohvaćanje biljaka ne uspije
  it('treba prikazati poruku o grešci ako dohvaćanje biljaka ne uspije', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(500); // Simuliramo grešku

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.allPlants).toEqual([]);
    expect(wrapper.vm.filteredPlants).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Kada nema dohvaćenih biljaka i search query je prazan, prikazuje se default poruka
    expect(wrapper.text()).toContain('Unesite pojam za pretragu ili prilagodite kriterije.');
    // Tablica ne bi trebala biti prikazana jer filteredPlants.length === 0
    expect(wrapper.find('[data-testid="plant-table"]').exists()).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  // Test 3: Treba pretraživati biljke po nazivu
  it('treba pretraživati biljke po nazivu', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Aktiviramo pretragu po nazivu
    await wrapper.find('[data-testid="checkbox-pretraži-po-nazivu-biljke"]').setValue(true);
    // Unosimo pojam za pretragu
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('ruža');
    // Kliknemo na gumb za pretragu
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Provjeravamo filtrirane rezultate
    expect(wrapper.vm.filteredPlants.length).toBe(1);
    expect(wrapper.vm.filteredPlants[0].nazivBiljke).toBe('Ruža');
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(1);
  });

  // Test 4: Treba pretraživati biljke po vrsti
  it('treba pretraživati biljke po vrsti', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Aktiviramo pretragu po vrsti
    await wrapper.find('[data-testid="checkbox-pretraži-po-vrsti-biljke"]').setValue(true);
    // Unosimo pojam za pretragu
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('cvjetnica');
    // Kliknemo na gumb za pretragu
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Provjeravamo filtrirane rezultate
    expect(wrapper.vm.filteredPlants.length).toBe(2);
    expect(wrapper.vm.filteredPlants.map(p => p.nazivBiljke)).toEqual(['Ruža', 'Orhideja']);
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(2);
  });

  // Test 5: Treba pretraživati biljke po nazivu I vrsti (AND logika)
  it('treba pretraživati biljke po nazivu I vrsti (AND logika)', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Aktiviramo pretragu po nazivu i vrsti
    await wrapper.find('[data-testid="checkbox-pretraži-po-nazivu-biljke"]').setValue(true);
    await wrapper.find('[data-testid="checkbox-pretraži-po-vrsti-biljke"]').setValue(true);
    // Unosimo pojam za pretragu ("ruža" je u nazivu, ali ne i u vrsti "Cvjetnica")
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('ruža');
    // Kliknemo na gumb za pretragu
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Očekujemo 0 rezultata jer "ruža" ne postoji u polju "vrstaBiljke" za nijednu biljku s tim nazivom
    expect(wrapper.vm.filteredPlants.length).toBe(0);
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(0);
    expect(wrapper.text()).toContain('Nema rezultata pretrage.');
  });

  // Test 6: Treba prikazati poruku "Nema rezultata pretrage." kada nema podudaranja
  it('treba prikazati poruku "Nema rezultata pretrage." kada nema podudaranja', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find('[data-testid="checkbox-pretraži-po-nazivu-biljke"]').setValue(true);
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('nepostojeća biljka');
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Provjeravamo da tablica nije prikazana
    expect(wrapper.find('[data-testid="plant-table"]').exists()).toBe(false);
    // Provjeravamo da je poruka o nedostatku rezultata prikazana
    expect(wrapper.text()).toContain('Nema rezultata pretrage.');
  });

  // Test 7: Treba prikazati sve biljke ako je polje za pretragu prazno, bez obzira na checkbokse
  it('treba prikazati sve biljke ako je polje za pretragu prazno, bez obzira na checkbokse', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Postavimo neki pojam i checkbokse, ali onda ispraznimo pojam
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('kaktus');
    await wrapper.find('[data-testid="checkbox-pretraži-po-nazivu-biljke"]').setValue(true);
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.filteredPlants.length).toBe(1); // Potvrđujemo da je filtrirano

    // Sada ispraznimo polje za pretragu i ponovno kliknemo Traži
    await wrapper.find('[data-testid="input-unesite-pojam-za-pretragu"]').setValue('');
    await wrapper.find('[data-testid="button-traži"]').trigger('click');
    await wrapper.vm.$nextTick();

    // Očekujemo da se prikažu sve biljke (ponovno originalni allPlants)
    expect(wrapper.vm.filteredPlants).toEqual(mockPlantsData);
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(mockPlantsData.length);
    expect(wrapper.text()).not.toContain('Nema rezultata pretrage.');
    // Očekujemo da poruka "Unesite pojam..." BUDE prisutna jer je searchQuery prazan
    expect(wrapper.text()).toContain('Unesite pojam za pretragu ili prilagodite kriterije.');
  });


  // Test 8: Treba prikazati poruku "Unesite pojam za pretragu..." kada je searchQuery prazan
  it('treba prikazati poruku "Unesite pojam za pretragu..." kada je searchQuery prazan', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    // Na početku je searchQuery prazan, pa bi poruka trebala biti vidljiva
    expect(wrapper.text()).toContain('Unesite pojam za pretragu ili prilagodite kriterije.');
    // Tablica bi trebala biti prikazana jer su filteredPlants jednake allPlants
    expect(wrapper.find('[data-testid="plant-table"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-testid="plant-table"] tbody tr').length).toBe(mockPlantsData.length);
  });

  // Test 10: Promjena stanja checkboxa bez pretrage ne mijenja rezultate
  it('promjena stanja checkboxa bez klika na Trazi ne mijenja prikazane biljke', async () => {
    mock.onGet('http://localhost:3000/api/biljke').reply(200, mockPlantsData);
    const wrapper = mountComponentWithQuasar();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.filteredPlants).toEqual(mockPlantsData); // Svi su prikazani na početku

    // Promijenimo stanje checkboxa, ali ne kliknemo "Traži"
    await wrapper.find('[data-testid="checkbox-pretraži-po-vrsti-biljke"]').setValue(true);
    await wrapper.vm.$nextTick();

    // Rezultati bi trebali ostati isti
    expect(wrapper.vm.filteredPlants).toEqual(mockPlantsData);
  });
});
