import Vue from "vue"
import VueRouter from "vue-router"
import ScheduleBookingView from "../views/ScheduleBookingView"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "scheduleBooking",
    component: ScheduleBookingView
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue")
  },
  {
    path: "/booking",
    name: "booking",
    component: () => import("../views/BookingNowView.vue")
  },
]

const router = new VueRouter({
  routes
})

export default router
