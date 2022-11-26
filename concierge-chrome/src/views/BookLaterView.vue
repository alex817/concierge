<template lang="">
    <div>
        <v-simple-table dense>
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">
                        </th>
                        <th v-for="(_, date) in scheduledBookingDetails" :key="date" class="text-left">
                            {{ date }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="timeslot in timeslots" :key="timeslot">
                        <td >{{ timeslot }}</td>
                        <td v-for="(_timeslots, date) in scheduledBookingDetails" :key="date">
                            <v-simple-checkbox @click="updateBookingSchedule(date, timeslot)"
                                :value="_timeslots[timeslot]" />
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </div>
</template>
<script>
export default {
  name: "BookLaterView",
  data: () => ({
    availDates: [],
    timeslots: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"],
    loading: false,
    scheduledBookingDetails: {},
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
      this.scheduledBookingDetails[date][timeslot] = !this.scheduledBookingDetails[date][timeslot]
      this.setBookingSchedule()
    },
    generateSchedule () {
      const d = {}
      for (const date of this.availDates) {
        d[date] = {}
        for (const timeslot of this.timeslots) {
          d[date][timeslot] = false
        }
      }
      this.scheduledBookingDetails = d
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
      return d
    },
    setBookingSchedule () {
      chrome.storage.local.set({ bookingSchedule: this.scheduledBookingDetails })
    },
    resetBookingSchedule () {
      this.generateSchedule()
      this.setBookingSchedule()
    }
  },
  created () {
    this.availDates = this.getDaysArray(new Date(), 14)
    console.table(this.availDates)
    chrome.storage.local.get("bookingSchedule", (res) => {
      this.generateSchedule()
      console.log(this.scheduledBookingDetails)
      if ("bookingSchedule" in res) {
        this.scheduledBookingDetails = this.mergeSchedules(res.bookingSchedule, this.scheduledBookingDetails)
      }
      this.setBookingSchedule()
      console.log(this.scheduledBookingDetails)
    })
  },
}
</script>
<style lang="">

</style>
