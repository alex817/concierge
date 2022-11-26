import Vue from "vue"
import Vuex from "vuex"
import FootballClubBooker from "@/js/session"

Vue.use(Vuex)

let booker
chrome.storage.local.get("login", (res) => {
  booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
})

export default new Vuex.Store({
  state: {
    booker: booker
  },
  getters: {
    getBooker: (state) => state.booker
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
