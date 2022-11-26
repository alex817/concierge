import Vue from "vue"
import VueRouter from "vue-router"
import BookLaterView from "../views/BookLaterView"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "BookLater",
    component: BookLaterView
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue")
  },
  {
    path: "/book-now",
    name: "BookNow",
    component: () => import("../views/BookNowView.vue")
  },
]

const router = new VueRouter({
  routes
})

export default router
