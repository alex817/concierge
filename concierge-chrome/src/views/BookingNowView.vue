<template lang="">
    <div>
    <AvailabilityTable :availSlots="availSlots" :tick="tick" :loading="loading.length != 0" :availDates="dates" @showBookingDialog="(court, date, timeslot) => showBookingDialog(court, date, timeslot)"/>
    <div class="text-center">
    <v-dialog
      v-model="showDialog"
      max-width="350"
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
            color="primary"
            text
            @click="bookCourt"
            :loading="bookLoading"
          >
            Confirm
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
    availSlots: [],
    dates: [],
    loading: [],
    tick: 0,
    dialogText: "",
    showDialog: false,
    bookingDetails: { court: "", date: "", timeslot: "" },
    bookLoading: false
  }),
  components: { AvailabilityTable },
  methods: {
    getSlots: function () {
      this.loading.push("date")
      this.booker.getDates().then((dates) => {
        this.loading.pop("date")
        this.dates = dates
        for (const date of dates) {
          this.loading.push(date)
          this.booker.getAvailSlots(date).then((slots) => {
            this.availSlots.push({ date: date, slots: slots })
            this.loading.pop(date)
          }
          )
        }
      }).catch((resp) => { this.loading = false })
    },
    retry: function (fn, retries = 3, err = null) {
      if (!retries) {
        return Promise.reject(err)
      }
      return fn().catch(err => {
        return this.retry(fn, (retries - 1), err)
      })
    },
    showBookingDialog: function (court, date, timeslot) {
      this.bookingDetails = { court: court, date: date, timeslot: timeslot }
      this.dialogText = `Booking court: ${this.bookingDetails.court} at ${this.bookingDetails.timeslot} on ${this.bookingDetails.date}`
      this.showDialog = true
    },
    bookCourt: function () {
      this.bookLoading = true
      this.booker.bookCourt(this.bookingDetails.court, this.bookingDetails.date, this.bookingDetails.timeslot).then(
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
    }
  },
  mounted () {
    this.count++
    chrome.storage.local.get("login", (res) => {
      this.booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
      this.booker.loginWithRetry().then(() => { this.getSlots() })
    })
  },
}
</script>
<style>

</style>
