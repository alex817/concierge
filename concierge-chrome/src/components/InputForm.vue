<template>
  <v-form v-model="valid">
    <v-container>
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
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => v.length <= 10 || "Name must be less than 10 characters",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
    ],
  }),
  methods: {
    saveLogin: function () {
      console.log(chrome)
      chrome.storage.local.set({ login: [{ username: this.username, password: this.password }] })
    },
    getLogin: function () {
      chrome.storage.local.get("login", (res) => { console.log(res); this.username = res.login[0].username; this.password = res.login[0].password })
    }
  },
  created () {
    this.getLogin()
  }
}
</script>
