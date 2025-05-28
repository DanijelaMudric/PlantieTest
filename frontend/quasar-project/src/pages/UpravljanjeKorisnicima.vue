<template>
  <q-page padding>
    <!-- Tablica korisnika -->
    <q-table
      :rows="korisnici"
      :columns="columns"
      row-key="naslov"
    />

    <!-- Mali FAB ispod tablice -->
    <div class="q-pa-md flex flex-center">
      <q-fab
        v-model="fab"
        label="Opcije admina"
        color="teal"
        icon="menu"
        direction="down"
        size="sm"
      >
        <!-- Akcija za dodavanje korisnika -->
        <q-fab-action color="primary" @click="otvoriDodavanjeKorisnika" icon="add" label="Dodaj korisnika" />

        <!-- Akcija za uklanjanje korisnika -->
        <q-fab-action color="negative" @click="otvoriUklanjanjeKorisnika" icon="delete" label="Ukloni korisnika" />
      </q-fab>
    </div>

    <!-- Popup za dodavanje korisnika -->
    <q-dialog v-model="prikaziDodajKorisnika">
      <q-card>
        <q-card-section>
          <div class="text-h6">Dodavanje korisnika</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="noviKorisnik.ime" label="Ime" />
          <q-input v-model="noviKorisnik.prezime" label="Prezime" />
          <q-input v-model="noviKorisnik.email" label="Email" />
          <q-input v-model="noviKorisnik.lozinka" label="Lozinka" />
          <q-input v-model="noviKorisnik.adresa" label="Adresa" />
          <q-input v-model="noviKorisnik.telefon" label="Telefon" />

        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" @click="prikaziDodajKorisnika = false" />
          <q-btn flat label="Dodaj" color="primary" @click="dodajKorisnika" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Popup za uklanjanje korisnika -->
    <q-dialog v-model="prikaziUkloniKorisnika">
      <q-card>
        <q-card-section>
          <div class="text-h6">Uklanjanje korisnika</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="korisnikZaUklanjanje" label="Unesite ID korisnika" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" @click="prikaziUkloniKorisnika = false" />
          <q-btn flat label="Ukloni" color="negative" @click="ukloniKorisnika(korisnikZaUklanjanje)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: "UpravljanjeKorisnicima",
  setup() {
    const korisnici = ref([]);
    const columns = [
      { name: 'ID_korisnika', align: 'left', label: 'ID', field: 'ID_korisnika' },
      { name: 'Ime_korisnika', align: 'left', label: 'Ime', field: 'Ime_korisnika' },
      { name: 'Prezime_korisnika', align: 'left', label: 'Prezime', field: 'Prezime_korisnika' },
      { name: 'Email_korisnika', align: 'left', label: 'Email', field: 'Email_korisnika' },
      { name: 'Lozinka_korisnika', align: 'left', label: 'Lozinka', field: 'Lozinka_korisnika' },
      { name: 'Adresa_korisnika', align: 'left', label: 'Adresa', field: 'Adresa_korisnika' },
      { name: 'Kontakt_korisnika', align: 'left', label: 'Telefon', field: 'Kontakt_korisnika' },
    ];

    const fab = ref(false);
    const prikaziDodajKorisnika = ref(false);
    const prikaziUkloniKorisnika = ref(false);
    const noviKorisnik = ref({ ime: "", prezime: "", email: "", telefon: "", lozinka: "", adresa:"" });
    const korisnikZaUklanjanje = ref("");

    const fetchKorisnik = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/korisnici");
        korisnici.value = response.data;
      } catch (error) {
        console.error("Greška prilikom dohvaćanja korisnika:", error);
      }
    };

    const dodajKorisnika = async () => {
      try {
        const response = await axios.post("http://localhost:3000/api/Korisnik", noviKorisnik.value);
        korisnici.value.push({
          ID_korisnika: response.data.id, // Pretpostavka da backend vraća ID
          Ime_korisnika: noviKorisnik.value.ime,
          Prezime_korisnika: noviKorisnik.value.prezime,
          Email_korisnika: noviKorisnik.value.email,
          Lozinka_korisnika: noviKorisnik.value.lozinka,
          Adresa_korisnika: noviKorisnik.value.adresa,
          Kontakt_korisnika: noviKorisnik.value.telefon,
        });
        noviKorisnik.value = { ime: "", prezime: "", email: "", telefon: "", lozinka: "", adresa:"" };
        prikaziDodajKorisnika.value = false;
      } catch (error) {
        console.error("Greška prilikom dodavanja korisnika:", error);
      }
    };

    const ukloniKorisnika = async (ID_korisnika) => {
      try {
        await axios.delete(`http://localhost:3000/api/Korisnik/${ID_korisnika}`);
        korisnici.value = korisnici.value.filter(k => k.ID_korisnika !== ID_korisnika);
        prikaziUkloniKorisnika.value = false;
      } catch (error) {
        console.error("Greška prilikom brisanja korisnika:", error);
      }
    };

    const otvoriDodavanjeKorisnika = () => {
      prikaziDodajKorisnika.value = true;
    };

    const otvoriUklanjanjeKorisnika = () => {
      prikaziUkloniKorisnika.value = true;
    };

    onMounted(() => {
      fetchKorisnik();
    });

    return {
      korisnici,
      columns,
      fab,
      prikaziDodajKorisnika,
      prikaziUkloniKorisnika,
      noviKorisnik,
      korisnikZaUklanjanje,
      dodajKorisnika,
      ukloniKorisnika,
      otvoriDodavanjeKorisnika,
      otvoriUklanjanjeKorisnika,
    };
  }
};
</script>
