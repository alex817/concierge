<template>
  <div id="app">
    <nav>
      <router-link to="/login">Login</router-link> |
      <router-link to="/booking">Booking</router-link>
    </nav>
    <router-view/>
  </div>
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
