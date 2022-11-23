<template>
  <v-form v-model="valid">
    <v-container>
      <h3>primary account</h3>
      <v-row>
        <v-col cols="6" md="2">
          <v-text-field v-model="username" label="Username" required>
          </v-text-field>
        </v-col>
        <v-col cols="6" md="2">
          <v-text-field v-model="password" label="Password" required>
          </v-text-field>
        </v-col>
      </v-row>
      <h3>secondary account</h3>
      <v-row>
        <v-col cols="6" md="2">
          <v-text-field v-model="username2" label="Username" required>
          </v-text-field>
        </v-col>
        <v-col cols="6" md="2">
          <v-text-field v-model="password2" label="Password" required>
          </v-text-field>
        </v-col>
      </v-row>
      <v-btn class="mr-4" @click="saveLogin">
        Save
      </v-btn>
    </v-container>
  </v-form>
</template>

<script>
export default {
  name: "IntputForm",
  data: () => ({
    valid: false,
    username: "",
    password: "",
    username2: "",
    password2: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => v.length <= 10 || "Name must be less than 10 characters",
    ],
  }),
  methods: {
    saveLogin: function () {
      console.log(chrome)
      chrome.storage.local.set({ login: [{ username: this.username, password: this.password }] })
      chrome.storage.local.set({ login2: [{ username: this.username2, password: this.password2 }] })
    },
    getLogin: function () {
      chrome.storage.local.get("login", (res) => { console.log(res); this.username = res.login[0].username; this.password = res.login[0].password })
      chrome.storage.local.get("login2", (res) => { console.log(res); this.username2 = res.login2[0].username; this.password2 = res.login2[0].password })
    }
  },
  created () {
    this.getLogin()
  }
}
</script>
