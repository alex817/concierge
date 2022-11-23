<template>
    <div>
    <v-data-table
        item-key="slot"
        :headers="headers"
        :items="slotData"
        loading
        class="elevation-1"
        loading-text="Loading... Please wait"
        dense
        :items-per-page="20"
        sort-by="slot"
    >
    <template v-for="header in headers.filter((h) => h.value != 'slot')" v-slot:[`item.${header.value}`]="{ item }">
        <div :key="header.value">
        <v-progress-circular
            indeterminate
            color="primary"
            v-if="item[header.value] == undefined"
        ></v-progress-circular>
        <v-icon color="green" v-else-if="item[header.value]['isAvailable']" >mdi-check-circle-outline</v-icon>
        <v-icon color="red" v-else-if="!item[header.value]['isAvailable']" >mdi-close-circle-outline</v-icon>
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
            data[slot.slot][slotsInDate.date] = { isAvailable: slot.isAvailable, courts: slot.courts }
          } else {
            const d = {}
            d[slotsInDate.date] = { isAvailable: slot.isAvailable, courts: slot.courts }
            data[slot.slot] = d
          }
        }
      }
      const rows = []
      for (const s in data) {
        rows.push({ ...data[s], slot: s })
      }
      return rows
    },
    headers () {
      const headers = [{ text: "", value: "slot", align: "start", sortable: false }]
      for (const date of this.availDates) {
        headers.push({ text: date, value: date, sortable: false })
      }
      return headers
    },
  }
}
</script>
<style>

</style>
