<template lang="">
    <div>
    <AvailabilityTable
      :availSlots="availSlots"
      :tick="tick"
      :loading="loading.length != 0"
      :availDates="dates"
      :currentBookings="currentBookings"
      @showBookingDialog="(courts, date, timeslot) => showBookingDialog(courts, date, timeslot)"/>
    <div class="text-center">
    <v-dialog
      v-model="showDialog"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Booking confirmation
        </v-card-title>

        <v-card-text>
          {{dialogText}}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-for="court in bookingDetails.courts"
            v-bind:key="court"
            color="primary"
            text
            @click="bookCourt(court)"
            :loading="bookLoading"
          >
            Book {{court}}
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="showDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
    </div>
</template>
<script>
import FootballClubBooker from "@/js/session"
import AvailabilityTable from "@/components/AvailabilityTable"
export default {
  name: "BookingNowView",
  data: () => ({
    booker: null,
    availSlots: {},
    dates: [],
    loading: [],
    tick: 0,
    dialogText: "",
    showDialog: false,
    bookingDetails: { courts: [], date: "", timeslot: "" },
    bookLoading: false,
    requests: [],
    currentBookings: { 20221201: { "14:00": true } }
  }),
  components: { AvailabilityTable },
  methods: {
    getData: function () {
      this.loading.push("date")
      this.booker.getDates().then((dates) => {
        this.loading.pop("date")
        this.dates = dates
        this.getBookings()
        for (const date of dates) {
          this.loading.push(date)
          this.booker.getAvailSlots(date).then((slots) => {
            const d = {}
            for (const slot of slots) {
              d[slot.slot] = { isAvailable: slot.isAvailable, availableCourts: slot.availableCourts }
            }
            this.availSlots[date] = d
            this.loading.pop(date)
            this.tick++
          }
          ).finally(() => this.loading.pop(date))
        }
      }).finally(() => { this.loading.pop("date") })
    },
    retry: function (fn, retries = 3, err = null) {
      if (!retries) {
        return Promise.reject(err)
      }
      return fn().catch(err => {
        return this.retry(fn, (retries - 1), err)
      })
    },
    showBookingDialog: function (courts, date, timeslot) {
      this.bookingDetails = { courts: courts, date: date, timeslot: timeslot }
      this.dialogText = `Booking court at ${this.bookingDetails.timeslot} on ${this.bookingDetails.date}`
      this.showDialog = true
    },
    bookCourt: function (court) {
      this.bookLoading = true
      this.booker.bookCourt(court, this.bookingDetails.date, this.bookingDetails.timeslot).then(
        (response) => {
          console.log(response)
          console.log(`Booked ${this.dialogText}`)
        }
      ).finally(
        () => {
          this.bookLoading = false
          this.showDialog = false
        }
      )
    },
    getBookings: function () {
      this.booker.getBookings(this.dates[0], this.dates[this.dates.length - 1]).then(
        (data) => {
          const d = {}
          for (const record of data) {
            const date = new Date(Date.parse(record.Date)).toLocaleDateString("sv").replaceAll("-", "")
            let timeslot
            if (record.Time.slice(5, 7) === "pm") {
              timeslot = (Number(record.Time.slice(0, 2)) + 12).toString() + ":00"
            } else {
              timeslot = record.Time.slice(0, 5)
            }
            if (!(date in d)) {
              d[date] = {}
            }
            if (!d[date][timeslot]) {
              d[date][timeslot] = record.Status !== "Cancel"
            }
          }
          this.currentBookings = d
          console.log(d)
          this.tick++
        }
      )
    }
  },
  mounted () {
    this.count++
    chrome.storage.local.get("login", (res) => {
      this.booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
      this.loading.push("login")
      this.booker.loginWithRetry().then(() => { this.getData(); this.loading.pop("login") })
    })
  },
  beforeDestroy () {
    this.booker.cancelRequests("Cancel requests due to view not longer in used")
  }
}
</script>
<style>

</style>
