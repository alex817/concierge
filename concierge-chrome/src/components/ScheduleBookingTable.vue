<template>
    <div>

        <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
          </th>
          <th v-for="date in availDates" :key="date" class="text-left">
            {{date}}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(dates, timeslot) in scheduledBookingDetails"
          :key="timeslot"
        >
          <td>{{timeslot}}</td>
          <td v-for="(isScheduled, date) in dates" :key="date"><v-simple-checkbox @click="$emit('updateBookingSchedule', date, timeslot)" :value="isScheduled" /></td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>

    </div>
</template>
<script>
export default {
  name: "ScheduleBookingTable",
  props: {
    scheduledBookingDetails: Object,
    loading: Boolean,
    availDates: Array,
    timeslots: Array,
    tick: Number
  },
  data: () => ({
    items: []
  }),
  computed: {
    headers () {
      const headers = [{ text: "", value: "slot", align: "start", sortable: false }]
      for (const date of this.availDates) {
        headers.push({ text: date, value: date, sortable: false })
      }
      return headers
    }
  },
  mounted () {
    for (const timeslot of this.timeslots) {
      const d = { slot: timeslot }
      for (const date of this.availDates) {
        d[date] = false
      }
      this.items.push(d)
    }
  }
}
</script>
<style>
</style>
