<template>
  <q-page class="flex flex-center">
    <div class="hero-section">
      <h1 class="hero-title" @mouseover="isHovered = true" @mouseleave="isHovered = false">
        Plantie - Vaš virtualni vrt
      </h1>
      <h2 class="hero-subtitle">
        Dobrodošli! Saznajte više o biljkama i njihovoj njezi.
      </h2>
    </div>

    <div class="column items-center content-container">
      <hr class="divider" />

      <h1 style="margin-top: 40px; font-size: 28px; color: #29854c; align-self: flex-start; margin-left: 20px;">
        Zanimljivosti i novosti
      </h1>

      <div style="margin-left: 20px; margin-top: 10px;">
        <p style="margin-bottom: 10px;">
          <b>Najveća pogreška koju ljudi rade kod zalijevanja biljaka</b>
        </p>
        <p style="margin-bottom: 20px;">
          Nepravilno zalijevanje može dovesti do truljenja korijena ili sušenja biljke. Pazite na potrebe svake vrste.
        </p>

        <p style="margin-bottom: 10px;">
          <b>Zimsko uređenje doma biljkama</b>
        </p>
        <p style="margin-bottom: 20px;">
          Biljke poput božićne zvijezde mogu unijeti toplinu i boju u vaš dom tijekom hladnih dana.
        </p>

        <p style="margin-bottom: 10px;">
          <b>Biljke obogaćuju prostor</b>
        </p>
        <p>
          Osim što pročišćavaju zrak, biljke doprinose mentalnom zdravlju i smanjuju stres.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      isHovered: false
    };
  },
};
</script>

<style scoped>
.q-page {
  background: url('https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260');
  background-size: cover;
  background-position: center;
  position: relative;
}

.content-container {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.hero-section {
  width: 100%;
  height: 500px;
  background: url('https://images.pexels.com/photos/1931143/pexels-photo-1931143.jpeg') center 50%;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 20px solid #29854c;
  padding-bottom: 20px;
}

.hero-title {
  font-size: 70px;
  color: rgb(51, 125, 65);
  font-family: 'Cursive', sans-serif;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgb(29, 51, 36);
  transition: transform 0.3s ease;
  margin-top: -180px;
}

.hero-title:hover {
  transform: scale(1.2);
}

.hero-subtitle {
  font-size: 24px;
  color: #297c4b;
  font-family: 'Cursive', sans-serif;
  margin-top: -50px;
  text-shadow: 1px 1px 2px rgb(29, 51, 36);
}

.divider {
  border: 1px solid #29854c;
  margin-top: 40px;
  width: 100%;
}
</style>
