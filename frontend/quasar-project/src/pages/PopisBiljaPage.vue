<template>
  <q-page padding>
    <div
      :style="{
        backgroundImage: 'url(https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }"
    >
      <div
        :style="{
          background: 'rgba(255, 255, 255, 0.7)',
          color: 'black',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid black',
          width: '97%',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          height: '100%',
          overflowY: 'auto',
        }"
      >
        <h1 class="text-center" :style="{ color: '#020503', marginTop: '0', paddingTop: '10px' }">Proizvodi</h1>

        <div class="product-grid">
          <q-card v-for="product in products" :key="product.nazivBiljke" class="product-card">
            <div class="image-container">
              <img :src="product.slikaBiljke" alt="Slika biljke" />
            </div>

            <q-card-section>
              <div class="text-h6">{{ product.nazivBiljke }}</div>
              <div>{{ product.opisBiljke }}</div>
              <div class="text-h6 text-primary">{{ product.cijena }} €</div>

              <q-btn
                label="Narudžba"
                color="primary"
                @click="handleProductClick(product)"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: []
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('http://localhost:3000/api/biljke');
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    handleProductClick(product) {
      console.log('Sifra biljke:', product.sifraBiljke);
      localStorage.setItem('sifraBiljke', product.sifraBiljke);
      this.$router.push(`/narudzba/${encodeURIComponent(product.nazivBiljke)}`);
    }
  }
};
</script>

<style scoped>
.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  padding: 20px 0;
}

.product-card {
  width: 100%;
}
</style>

