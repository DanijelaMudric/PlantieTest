<template>
  <q-page>
    <div
      class="q-pa-md"
      style="background-image: url('https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'); background-size: cover; background-position: center; min-height: 100vh;"
    >
      <div
        class="q-pa-md"
        style="background: rgba(255, 255, 255, 0.9); color: black; padding: 20px; border-radius: 10px;"
      >
        <h1 class="centered-title">O nama</h1>

        <p>Naša misija je približiti ljepotu biljaka svakome domu.</p>

        <div class="location">
          <p><strong>Lokacija:</strong> Vukovarska ul. 58, 51000, Rijeka</p>

          <div class="location-image-container">
            <img src="/images/mapa2.png" alt="Plantie lokacija" class="location-image" />
            <div class="flower-overlay">🌸</div>
          </div>
        </div>

        <p>U našoj ponudi nalaze se razne vrste biljaka koje uljepšavaju vaš prostor.</p>
        <p>Uvijek smo ovdje za vas, spremni pomoći savjetom i podrškom.</p>

        <q-btn
          color="green"
          label="Posjetite nas"
          icon="open_in_new"
          href="https://www.veleri.hr/hr/studijski-programi/124/strucni-prijediplomski-studij-informatika"
          target="_blank"
        />

        <hr style="margin: 30px 0;" />

        <!-- Pošalji zahtjev administraciji -->
        <h2 style="color: #29854c; margin-bottom: 10px;">Imaš prijedlog ili pitanje? Pošalji zahtjev administraciji!</h2>

        <q-input
          v-model="zahtjev"
          label="Unesite svoj zahtjev"
          filled
          type="textarea"
          autogrow
        />

        <q-btn
          color="primary"
          label="Pošalji"
          class="q-mt-md"
          @click="posaljiZahtjev"
        />

        <p v-if="poruka" style="margin-top: 10px; color: green;">{{ poruka }}</p>
        <p v-if="greska" style="margin-top: 10px; color: red;">{{ greska }}</p>

        <hr style="margin: 30px 0;" />

<h2 style="color: #29854c; margin-bottom: 10px;">Pomoćne upute</h2>
<p>Preuzmite PDF s detaljnim uputama za korištenje Plantie aplikacije:</p>

<q-btn
  color="secondary"
  label="Preuzmi PDF"
  icon="download"
  href="/help/plantie-upute.pdf"
  target="_blank"
/>

<hr style="margin: 30px 0;" />

<h2 style="color: #29854c; margin-bottom: 10px;">Video tutorijal</h2>
<p>Pogledajte naš kratki video vodič za korištenje Plantie aplikacije:</p>

<video controls style="width: 100%; max-width: 720px; border-radius: 10px; margin-bottom: 20px;">
  <source src="/help/video-tutorijal.mp4" type="video/mp4" />
  Vaš preglednik ne podržava HTML5 video.
</video>

<p>Za dodatne upute, preuzmite CHM datoteku pomoći:</p>
<q-btn
  color="secondary"
  icon="download"
  label="Preuzmi CHM datoteku"
  href="/help/PlantieHelp.chm"
  target="_blank"
  download
/>



      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const zahtjev = ref('')
const poruka = ref('')
const greska = ref('')

const posaljiZahtjev = async () => {
  poruka.value = ''
  greska.value = ''

  if (!zahtjev.value.trim()) {
    greska.value = 'Molimo unesite zahtjev.'
    return
  }

  try {
    const response = await axios.post('http://localhost:3000/api/zahtjev', {
      zahtjev: zahtjev.value
    })

    poruka.value = response.data.message || 'Zahtjev uspješno poslan.'
    zahtjev.value = ''
  } catch (error) {
    console.error('Greška:', error)
    greska.value = error.response?.data?.error || 'Došlo je do pogreške.'
  }
}
</script>
<style scoped>
h1 {
  color: inherit;
  text-align: center;
  margin-top: 0;
}

h2 {
  font-size: 22px;
  font-weight: bold;
}

.location {
  margin-top: 20px;
  font-size: 18px;
  color: inherit;
}

.location-image-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin-top: 20px;
}

.location-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.flower-overlay {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  color: inherit;
  z-index: 1;
}
</style>
