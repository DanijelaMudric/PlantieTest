<template>
  <q-page>
    <div
      class="q-pa-md"
      style="background-image: url('https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'); background-size: cover; background-position: center; min-height: 100vh;"
    >
      <div
        class="q-pa-md"
        style="background: rgba(255, 255, 255, 0.9); color: black; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto;"
      >
        <h2 class="text-center" style="font-size: 3rem; margin-top: 40px; margin-bottom: 40px; color: black;">
          Prijava
        </h2>

        <!-- Korisnički login -->
        <q-input
          v-model="user.email"
          label="Email"
          filled
          :rules="[val => val && val.length > 0 || 'Popunite sva polja']"
          class="q-mb-md"
          style="color: black;"
        />
        <q-input
          v-model="user.password"
          label="Lozinka"
          type="password"
          filled
          :rules="[val => val && val.length > 0 || 'Popunite sva polja']"
          class="q-mb-md"
          style="color: black;"
        />
        <q-btn
          label="Prijava"
          color="primary"
          @click="submitForm"
          class="full-width q-mb-md"
          style="background-color: #29854c; color: white; border-radius: 8px;"
        />

        <!-- Admin login -->
        <q-input
          v-model="adminId"
          label="Admin ID"
          filled
          class="q-mb-md"
          style="color: black;"
        />
        <q-btn
          label="Prijava kao admin"
          color="secondary"
          @click="loginAdmin"
          class="full-width q-mb-md"
          style="border-radius: 8px;"
        />

        <q-btn
          label="Odjava"
          color="red"
          @click="logout"
          class="full-width"
          style="border-radius: 8px;"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    return {
      router,
    };
  },
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
      adminId: "", 
    };
  },
  methods: {
    submitForm() {
      if (this.isFormValid()) {
        axios
          .post("http://localhost:3000/api/prijava", {
            Email_korisnika: this.user.email,
            Lozinka_korisnika: this.user.password,
          })
          .then((response) => {
            const { message, korisnik } = response.data;
            console.log(message);

            if (korisnik && korisnik.Ime_korisnika) {
              localStorage.setItem("user", JSON.stringify(korisnik));
              localStorage.setItem("Ime_korisnika", korisnik.Ime_korisnika);
              localStorage.setItem("ID_korisnika", korisnik.ID_korisnika);
            }

            alert('Prijava uspješna!');
            this.router.push("/");
          })
          .catch((error) => {
            console.error("Greška prilikom prijave:", error);
            alert('Greška prilikom prijave.');
          });
      } else {
        alert('Sva polja su obavezna.');
      }
    },
    async loginAdmin() {
      if (this.adminId) {
        try {
          const response = await axios.get('http://localhost:3000/Admin', {
            params: { adminId: this.adminId }
          });

          if (response.data && response.data[0].id_exists === 1) {
            this.$router.push({ name: 'AdminPage' });
          } else {
            alert('Ne, ne! Neispravan ID admina.');
          }
        } catch (error) {
          console.error('Error during admin login:', error);
          alert('Došlo je do greške pri prijavi.');
        }
      } else {
        alert('Molimo unesite ID admina.');
      }
    },
logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("Ime_korisnika");
  localStorage.removeItem("ID_korisnika");
  this.user.email = "";
  this.user.password = "";
  this.adminId = "";
  alert("Odjava uspješna!"); // Dodana poruka
  this.router.push("/login");
  window.location.reload();
}
,
    isFormValid() {
      return this.user.email && this.user.password;
    },
    resetForm() {
      this.user.email = "";
      this.user.password = "";
      this.adminId = "";
    },
  },
};
</script>
<style scoped>
/* Style for title */
h2 {
  font-size: 6rem;
  margin-top: 40px;
  margin-bottom: 100px;
  text-align: center;
  color: inherit;
}
</style>
