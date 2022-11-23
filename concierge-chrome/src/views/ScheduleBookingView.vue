<template lang="">
    <div>
        <ScheduleBookingTable v-if="scheduledBookingDetails != {}" :tick="tick" :timeslots="timeslots" :availDates="availDates" :loading="loading" :scheduledBookingDetails="scheduledBookingDetails" @updateBookingSchedule="(date, timeslot) => updateBookingSchedule(date, timeslot)"/>
    </div>
</template>
<script>
import ScheduleBookingTable from "@/components/ScheduleBookingTable"
import FootballClubBooker from "@/js/session"
export default {
  name: "ScheduleBookingView",
  components: { ScheduleBookingTable },
  data: () => ({
    availDates: [],
    timeslots: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    loading: false,
    scheduledBookingDetails: {},
    tick: 0
  }),
  methods: {
    formatDate: function (date) {
      const d = new Date(date)
      let month = "" + (d.getMonth() + 1)
      let day = "" + d.getDate()
      const year = d.getFullYear()

      if (month.length < 2) { month = "0" + month }
      if (day.length < 2) { day = "0" + day }

      return [year, month, day].join("")
    },
    getDaysArray: function (start, range) {
      const arr = []
      for (const offset of [...Array(range).keys()]) {
        const d = new Date()
        d.setDate(start.getDate() + offset)
        arr.push(this.formatDate(d))
      }
      return arr
    },
    updateBookingSchedule: function (date, timeslot) {
      console.log(date, timeslot)
      this.scheduledBookingDetails[timeslot][date] = !this.scheduledBookingDetails[timeslot][date]
      this.setBookingSchedule()
    },
    generateSchedule () {
      for (const timeslot of this.timeslots) {
        this.scheduledBookingDetails[timeslot] = {}
        for (const date of this.availDates) {
          this.scheduledBookingDetails[timeslot][date] = false
        }
      }
    },
    mergeSchedules (stale, fresh) {
      const d = {}
      for (const key in fresh) {
        if (key in stale) {
          d[key] = stale[key]
        } else {
          d[key] = fresh[key]
        }
      }
      this.tick++
      return d
    },
    setBookingSchedule () {
      console.log("set schedule")
      chrome.storage.local.set({ bookingSchedule: this.scheduledBookingDetails })
    }
  },
  created () {
    this.availDates = this.getDaysArray(new Date(), 14)
    chrome.storage.local.get("bookingSchedule", (res) => {
      this.generateSchedule()
      if ("bookingSchedule" in res) {
        console.log(res.bookingSchedule)
        this.scheduledBookingDetails = this.mergeSchedules(res.bookingSchedule, this.scheduledBookingDetails)
        console.log(this.scheduledBookingDetails)
      }
      this.setBookingSchedule()
    })
    this.loading = true
    chrome.storage.local.get("login", (res) => {
      this.booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
      this.booker.loginWithRetry().then(() => {
        this.booker.getAvailSlots(this.availDates[1]).then((availSlots) => {
          this.timeslots = []
          for (const slot of availSlots) {
            this.timeslots.push(slot.slot)
          }
          this.loading = false
        })
      })
    })
    // fetch schedule from storage

    // generate new schedule based on current date
    // merge both schedules
  }
}
</script>
<style lang="">

</style>
