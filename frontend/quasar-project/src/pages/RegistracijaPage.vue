<template>
  <q-page>
    <h1>Registracija</h1>
    <q-input filled v-model="ime" label="Ime" />
    <q-input filled v-model="prezime" label="Prezime" />
    <q-input filled v-model="email" label="Email" />
    <q-input filled v-model="lozinka" label="Lozinka" type="password" />
    <q-input filled v-model="adresa" label="Adresa"/>
    <q-input filled v-model="telefon" label="Telefon" />


    <q-btn color="primary" label="Potvrdi" @click="registerUser" />
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      ime: '',
      prezime: '',
      email: '',
      lozinka: '',
      adresa: '',
      telefon: ''
    };
  },
  methods: {
    async registerUser() {
      // Provjera da li su svi podaci uneseni
      if (this.ime && this.prezime && this.email && this.lozinka && this.adresa && this.telefon) {
        try {
          const response = await axios.post('http://localhost:3000/api/Korisnik', {
            ime: this.ime,
            prezime: this.prezime,
            email: this.email,
            lozinka: this.lozinka,
            adresa: this.adresa,
            telefon: this.telefon
          });

          // Ako je registracija uspješna
          alert(response.data.message);
          // Ovdje možete preusmjeriti korisnika na drugu stranicu nakon uspješne registracije
        } catch (error) {
          alert(error.response.data.error || 'Došlo je do greške pri registraciji.');
          console.error(error);
        }
      } else {
        alert('Molimo ispunite sva polja.');
      }
    },
  },
};
</script>


