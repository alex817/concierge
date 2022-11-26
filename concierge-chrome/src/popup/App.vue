<template>
  <v-app id="app">
    <nav>
      <router-link to="/">Book later</router-link> |
      <router-link to="/book-now">Book now</router-link> |
      <router-link to="/login">Login</router-link>
    </nav>
    <router-view/>
  </v-app>
</template>

<script>

export default {
  name: "App",
  components: { },
}
</script>

<style>
html {
  width: 800px;
  height: 600px;
}
</style>
