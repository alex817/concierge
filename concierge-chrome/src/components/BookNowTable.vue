<template>
    <div>
        <v-progress-linear
                indeterminate
                color="blue darken-2"
                v-if="loading"
        ></v-progress-linear>
        <v-simple-table dense>
            <template v-slot:default>
                <thead>
                    <tr>
                        <th class="text-left">
                        </th>
                        <th v-for="date in availDates" :key="date" class="text-left">
                            {{ date }}
                        </th>
                    </tr>
                </thead>

                <tbody>

                    <tr v-for="timeslot in timeslots" :key="timeslot">
                        <td>{{ timeslot }}</td>
                        <td v-for="date in availDates" :key="date">
                            <v-icon color="grey darken-2"
                                v-if="datesWithAvailableData.includes(date) && availSlots[date][timeslot] == undefined">
                                mdi-stop-circle-outline</v-icon>
                            <v-progress-circular indeterminate color="primary"
                                v-else-if="!datesWithAvailableData.includes(date)"></v-progress-circular>
                            <v-icon v-else-if="checkBooking(date, timeslot)" color="blue darken-2">
                                mdi-alpha-b-circle-outline</v-icon>
                            <v-tooltip v-else-if="availSlots[date][timeslot]['isAvailable']" bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon v-bind="attrs" v-on="on" color="green darken-2"
                                        @click="$emit('showBookingDialog', availSlots[date][timeslot]['availableCourts'], date, timeslot)">
                                        mdi-check-circle-outline</v-icon>
                                </template>
                                <span>{{ availSlots[date][timeslot]['availableCourts'].join(", ") }}</span>
                            </v-tooltip>
                            <v-icon color="red darken-2" v-else-if="!availSlots[date][timeslot]['isAvailable']">
                                mdi-close-circle-outline
                            </v-icon>
                        </td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
    </div>
</template>
<script>
export default {
  name: "BookingNowTable",
  props: {
    availSlots: Object,
    availDates: Array,
    tick: Number,
    loading: Boolean,
    currentBookings: Object
  },
  data: () => ({
  }),
  methods: {
    checkBooking: function (date, timeslot) {
      if (date in this.currentBookings) {
        if (timeslot in this.currentBookings[date]) {
          return this.currentBookings[date][timeslot]
        }
      }
      return false
    }
  },
  computed: {

    headers () {
      const headers = [{ text: "", value: "slot", align: "start", sortable: false }]
      for (const date of this.availDates) {
        headers.push({ text: date, value: date, sortable: false })
      }
      return headers
    },
    datesWithAvailableData () {
      console.log(this.tick)
      const dates = []
      for (const slotsInDate in this.availSlots) {
        dates.push(slotsInDate)
      }
      return dates
    },
    timeslots () {
      console.log(this.tick)
      const timeslots = []
      for (const date in this.availSlots) {
        for (const timeslot in this.availSlots[date]) {
          if (!timeslots.includes(timeslot)) {
            timeslots.push(timeslot)
          }
        }
      }
      return timeslots.sort()
    }
  },
  created () {
  }
}
</script>
<style>

</style>
