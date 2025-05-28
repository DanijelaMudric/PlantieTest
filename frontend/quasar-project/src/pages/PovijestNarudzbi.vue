<template>
  <div class="page-container">
    <div class="content-container">
      <h1>Povijest narudžbi</h1>
      <div v-if="!isLoggedIn">
        <p>Morate biti prijavljeni kako biste vidjeli narudžbe.</p>
      </div>
      <div v-else>
        <div v-if="loading">
          <p>Učitavanje narudžbi...</p>
        </div>
        <div v-else-if="orders.length">
          <ul>
            <li v-for="order in orders" :key="order.idKosarice">
              <h3>{{ order.nazivBiljke }}</h3>
              <p>Vrsta biljke: {{ order.vrstaBiljke }}</p>
              <p>Količina: {{ order.kolicina }}</p>
              <p>Cijena: {{ formatCurrency(order.total) }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>Nemate narudžbi.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      orders: [],
      loading: false,
      isLoggedIn: false,
    };
  },
  methods: {
    fetchOrders() {
      const korisnikId = localStorage.getItem("ID_korisnika");

      if (!korisnikId) {
        this.isLoggedIn = false;
        return;
      }

      this.isLoggedIn = true;
      this.loading = true;

      axios
        .get(`http://localhost:3000/NarudzbeKorisnika/${korisnikId}`)
        .then((response) => {
          this.orders = response.data;
        })
        .catch(() => {
          alert('Greška prilikom dohvaćanja narudžbi.');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("hr-HR", {
        style: "currency",
        currency: "EUR",
      }).format(value);
    },
  },
  created() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.page-container {
  background-image: url("https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  background-size: contain;
  background-position: center;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 97%;
  max-width: 1800px;
  text-align: center;
  color: #333;
}

h1 {
  font-size: 6rem;
  margin-top: 10px;
  margin-bottom: 60px;
  color: inherit;
}

p {
  color: #193019;
  text-align: center;
  font-size: 1.1rem;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: rgba(69, 170, 86, 0.7);
  margin: 15px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 600px;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
}

h3 {
  margin: 0;
  color: #0c2211;
  font-weight: bold;
}

li p {
  font-size: 1.2rem;
  color: rgb(13, 41, 17);
}
</style>
