const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/popisbilja', component: () => import('pages/PopisBiljaPage.vue') },
      { path: '/pretrazivanje', component: () => import('pages/PretrazivanjeBilja.vue') },
      { path: '/onama', component: () => import('pages/ONamaPage.vue') },
      { path: '/login', component: () => import('pages/LoginPage.vue') },
      { path: '/registracija', component: () => import('pages/RegistracijaPage.vue') },
      { path: '/povijest', component: () => import('pages/PovijestNarudzbi.vue') },
            {
        path: "narudzba/:nazivBiljke", // Parametar `id` za biljku
        component: () => import("pages/NarudzbaPage.vue"),
      },
    ]
  },
  {
    path: '/admin',
    component: () => import('layouts/Admin.vue'),
    children: [
      { path: '', component: () => import('pages/AdminPage.vue'), name: 'AdminPage' },
      { path: '/admin/biljke', component: () => import('pages/UpravljanjeBiljem.vue') },
      { path: '/admin/korisnici', component: () => import('pages/UpravljanjeKorisnicima.vue') },
      { path: '/admin/narudzbe', component: () => import('pages/UpravljanjeNarudžbama.vue') },
      { path: '/admin/objave', component: () => import('pages/UpravljanjeObjavama.vue') }]
  },
  // Ruta za 404 stranicu:
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

