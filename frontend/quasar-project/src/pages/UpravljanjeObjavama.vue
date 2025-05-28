<template>
  <q-page class="flex flex-center column">
    <div style="width: 90%; max-width: 1200px; height: 600px; overflow: auto;">
      <q-table
        :rows="zahtjevi"
        :columns="columns"
        row-key="ID_Zahtjeva"
        flat
        style="font-size: 16px;"
      />

      <div class="q-mt-lg">
        <q-input v-model="noviZahtjev.Zahtjev" label="Unesi ID zahtjeva kojeg želiš izbrisati:" filled />
        <q-btn color="red" label="Izbriši" class="q-mt-md" @click="izbrisiZahtjev" />
      </div>
    </div>

    <!-- Spinner while loading -->
    <q-spinner v-if="loading" color="blue" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Reactive variables
const zahtjevi = ref([]); // Stores the fetched data
const noviZahtjev = ref({ Zahtjev: '' }); // Stores the new comment
const loading = ref(true); // Indicates whether data is being loaded

// Columns for q-table
const columns = [
  { name: 'ID_Zahtjeva', align: 'left', label: 'ID Zahtjeva', field: 'ID_Zahtjeva', sortable: true },
  { name: 'Zahtjev', align: 'left', label: 'Komentari', field: 'Zahtjev' },
];

// Fetch requests
const fetchZahtjevi = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/zahtjevi');
    zahtjevi.value = response.data; // Set the fetched data
  } catch (error) {
    console.error('Greška prilikom dohvaćanja zahtjeva:', error);
  } finally {
    loading.value = false; // Stop loading spinner
  }
};

// Function to delete a specific row
const izbrisiZahtjev = async () => {
  const ID_Zahtjeva = Number(noviZahtjev.value.Zahtjev);

  if (!ID_Zahtjeva) {
    alert('Molimo unesite važeći ID zahtjeva.');
    return;
  }

  try {
    // Make a DELETE request to the server
    await axios.delete(`http://localhost:3000/api/zahtjev/${ID_Zahtjeva}`);

    // Remove the deleted item from the local list
    zahtjevi.value = zahtjevi.value.filter((z) => z.ID_Zahtjeva !== ID_Zahtjeva);

    // Clear the input field
    noviZahtjev.value.Zahtjev = '';

    alert('Zahtjev uspješno obrisan!');
  } catch (error) {
    console.error('Greška prilikom brisanja zahtjeva:', error);
    alert('Došlo je do greške prilikom brisanja zahtjeva.');
  }
};

// Fetch comments when the component is mounted
onMounted(() => {
  fetchZahtjevi();
});
</script>

