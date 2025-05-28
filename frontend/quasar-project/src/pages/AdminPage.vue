<template>
  <q-page class="flex flex-center column">
    <!-- Title and Subtitle Wrapper -->
    <div class="title-container">
      <!-- Title -->
      <h1 class="title">Dobrodošli admini!</h1>

      <!-- Description -->
      <p class="description">Ovdje možete upravljati sa vašom Plantie trgovinom!</p>
    </div>

    <!-- Logo Image -->
    <img alt="Plantie Logo" src="~assets/Plantie_DMudric.svg" class="logo" />
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'IndexPage'
});
</script>

<style scoped>
  /* Učitavanje fancy fonta */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

  /* Stil za okvir koji sadrži naslov i podnaslov */
  .title-container {
    border: 2px solid #006400; /* Tamno zeleni okvir */
    border-radius: 15px; /* Zaobljeni rubovi */
    padding: 20px; /* Unutarnji razmak */
    background-color: #f0fff0; /* Svijetlo zelena pozadina */
    text-align: center; /* Centriranje teksta */
    margin-top: 50px; /* Povećan razmak od vrha stranice */
    margin-bottom: 30px; /* Razmak ispod okvira */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Blaga sjena */
  }

  /* Stil za naslov */
  .title {
    font-family: 'Playfair Display', serif; /* Fancy font */
    font-size: 4.5rem; /* Povećana veličina fonta */
    font-weight: 700; /* Deblji font */
    color: #006400; /* Tamno zelena boja */
    margin: 0; /* Ukloni margine naslova */
  }

  /* Stil za podnaslov */
  .description {
    font-family: 'Playfair Display', serif; /* Fancy font za opis */
    font-size: 2rem; /* Povećana veličina fonta */
    font-weight: 500; /* Lagano podebljan tekst */
    color: #006400; /* Tamno zelena boja */
    margin: 10px 0 0; /* Mali razmak iznad podnaslova */
  }

  /* Stil za logo */
  .logo {
    width: 300px; /* Početna veličina loga */
    height: auto; /* Održavanje omjera */
    margin-top: 30px; /* Prostor iznad loga */
    transition: transform 0.3s ease-in-out; /* Dodana tranzicija za glatki efekt */
  }

  .logo:hover {
    transform: scale(1.8); /* Efekt povećanja za 10% */
  }
</style>
