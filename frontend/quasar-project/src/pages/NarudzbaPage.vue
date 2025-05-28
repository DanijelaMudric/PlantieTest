<template>
  <q-page padding>
    <div
      class="q-pa-md"
      style="background-image: url('https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'); background-size: cover; background-position: center; min-height: 100vh;"
    >
      <div
        class="q-pa-md"
        style="
          background: rgba(255, 255, 255, 0.9);
          color: black;
          padding: 20px;
          border-radius: 10px;
        "
      >
        <div v-if="product">
          <div class="text-h5">Narudžba za biljku: {{ product.nazivBiljke }}</div>
          <q-form @submit="submitOrder">
            <q-input v-model="orderDetails.kolicina" label="Količina" type="number" required />
            <q-input v-model="orderDetails.velicinaBiljke" label="Velicina(S/M/L)" required />
            <q-btn label="Dodajte" type="submit" color="primary" />
          </q-form>
        </div>
        <div v-else>
          <div class="text-subtitle1 text-negative">Biljka nije pronađena.</div>
        </div>

        <q-banner v-if="showBanner" class="bg-primary text-white">
          <div v-if="isUserLoggedIn">
            <div>Uspješno ste naručili biljku: <strong>{{ product.nazivBiljke }}</strong></div>
            <div><strong>Količina:</strong> {{ orderDetails.kolicina }}</div>
            <div><strong>Velicina:</strong> {{ orderDetails.velicinaBiljke }}</div>
            <div><strong>Ime:</strong> {{ orderDetails.ime }} {{ orderDetails.prezime }}</div>
            <div><strong>Adresa:</strong> {{ orderDetails.adresa }}</div>
          </div>
          <div v-else>
            <div>Morate se prvo registrirati da biste mogli naručiti!</div>
          </div>
          <template v-slot:action>
            <q-btn flat color="white" label="Zatvori" @click="closeBanner" />
          </template>
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      product: null,
      orderDetails: {
        ime: "",
        prezime: "",
        adresa: "",
        kolicina: 1,
        velicinaBiljke: "",
        ID_korisnika: null,
      },
      isUserLoggedIn: false,
      showBanner: false,
    };
  },
  mounted() {
    const nazivBiljke = this.$route.params.nazivBiljke;
    if (!nazivBiljke) {
      console.error("Naziv biljke nije pronađen u URL-u!");
      this.$router.push("/");
      return;
    }
    this.fetchProduct(nazivBiljke);
    this.fetchUserData();
  },
  methods: {
    async fetchProduct(nazivBiljke) {
      try {
        const response = await axios.get(`http://localhost:3000/api/biljke/${nazivBiljke}`);
        this.product = response.data;
      } catch (error) {
        console.error("Greška pri dohvaćanju biljke:", error);
      }
    },
    fetchUserData() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        this.isUserLoggedIn = true;
        this.orderDetails.ime = user.Ime_korisnika;
        this.orderDetails.prezime = user.Prezime_korisnika;
        this.orderDetails.adresa = user.Adresa_korisnika;
        this.orderDetails.ID_korisnika = user.ID_korisnika;
      }
    },
    async submitOrder() {
      if (!this.isUserLoggedIn) {
        this.showBanner = true;
        return;
      }

      try {
        const order = {
          nazivBiljke: this.product.nazivBiljke,
          velicinaBiljke: this.product.vrstaBiljke,
          kolicina: this.orderDetails.kolicina,
          ID_Kosarice: null,
          ID_korisnika: this.orderDetails.ID_korisnika,
          sifraBiljke: this.product.sifraBiljke,
        };

        const response = await axios.post("http://localhost:3000/api/dodavanjenarudzbe", order);
        console.log("Narudžba uspješno poslana:", response.data);
        this.showBanner = true;
      } catch (error) {
        console.error("Greška pri slanju narudžbe:", error);
      }
    },
    closeBanner() {
      this.showBanner = false;
      this.$router.push("/proizvodi");
    }
  },
};
</script>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: inherit;
}
</style>
