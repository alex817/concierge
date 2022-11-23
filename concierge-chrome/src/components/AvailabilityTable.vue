<template>
    <div>
    <v-data-table
        item-key="slot"
        :headers="headers"
        :items="slotData"
        :loading="loading"
        class="elevation-1"
        loading-text="Loading... Please wait"
        dense
        :items-per-page="20"
        sort-by="slot"
        hide-default-footer
    >
    <template v-for="header in headers.filter((h) => h.value != 'slot')" v-slot:[`item.${header.value}`]="{ item }">
        <div :key="header.value">
        <v-icon color="grey darken-2"  v-if="datesWithAvailableData.includes(header.value) && item[header.value] == undefined" >mdi-stop-circle-outline</v-icon>
        <v-progress-circular
            indeterminate
            color="primary"
            v-else-if="!datesWithAvailableData.includes(header.value)"
        ></v-progress-circular>
        <v-icon color="green darken-2"  v-else-if="item[header.value]['isAvailable']" @click="$emit('showBookingDialog', item[header.value]['courts'][0], header.value, item['slot'])">mdi-check-circle-outline</v-icon>
        <v-icon color="red darken-2" v-else-if="!item[header.value]['isAvailable']" >mdi-close-circle-outline</v-icon>
    </div>
    </template>

    </v-data-table>
    </div>
</template>
<script>
export default {
  name: "AvailabilityTable",
  props: {
    availSlots: Array,
    availDates: Array,
    tick: Number,
    loading: Boolean
  },
  data: () => ({
  }),
  computed: {
    slotData () {
      const data = {}
      for (const slotsInDate of this.availSlots) {
        for (const slot of slotsInDate.slots) {
          // data[slot.]
          if (slot.slot in data) {
            data[slot.slot][slotsInDate.date] = { isAvailable: slot.isAvailable, courts: slot.availableCourts }
          } else {
            const d = {}
            d[slotsInDate.date] = { isAvailable: slot.isAvailable, courts: slot.availableCourts }
            data[slot.slot] = d
          }
        }
      }
      const rows = []
      for (const s in data) {
        rows.push({ ...data[s], slot: s })
      }
      console.log(rows)
      return rows
    },
    headers () {
      const headers = [{ text: "", value: "slot", align: "start", sortable: false }]
      for (const date of this.availDates) {
        headers.push({ text: date, value: date, sortable: false })
      }
      return headers
    },
    datesWithAvailableData () {
      const dates = []
      for (const slotsInDate of this.availSlots) {
        dates.push(slotsInDate.date)
      }
      return dates
    }
  }
}
</script>
<style>
</style>
