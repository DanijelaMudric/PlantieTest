<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Plantie
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Izbornik
        </q-item-label>

       <q-item
          v-for="link in linksList"
          :key="link.title"
          clickable
          tag="router-link"
          :to="link.to"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

defineOptions({
  name: 'MainLayout'
})

const linksList = [
  {
    title: 'Naslovna',
    caption: 'Početna stranica',
    icon: 'home',
    to: '/'
  },
   {
    title: 'Proizvodi',
    caption: 'Pogledajte sve ponuđene biljke!',
    icon: 'library_books',
    to: '/popisbilja'
  },
  {
    title: 'PretrazivanjeBilja',
    caption: 'Pretraži bilje',
    icon: 'search',
    to: '/pretrazivanje'
  },
    {
    title: 'Vaše narudžbe',
    caption: 'Vaše ne obavljene narudzbe',
    icon: 'search',
    to: '/povijest'
  },
  {
    title: 'O nama',
    caption: 'Informacije o Plantie trgovini',
    icon: 'info',
    to: '/onama'
  },
  {
    title: 'Login',
    caption: 'Prijavite se',
    icon: 'login',
    to: '/login'
  },
  {
    title: 'Registracija',
    caption: 'Registrirajte se',
    icon: 'person_add',
    to: '/registracija'
  },

]


const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
