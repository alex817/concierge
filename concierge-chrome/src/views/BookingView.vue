<template lang="">
    <div>
    <AvailabilityTable :availSlots="availSlots" :tick="tick" :loading="loading.length != 0" :availDates="dates"/>
    </div>
</template>
<script>
import FootballClubBooker from "@/js/session"
import AvailabilityTable from "@/components/AvailabilityTable"
export default {
  data: () => ({
    booker: null,
    availSlots: [],
    dates: [],
    loading: [],
    tick: 0
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
    }
  },
  mounted () {
    this.count++
    chrome.storage.local.get("login", (res) => {
      this.booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
      this.booker.loginWithRetry().then(() => { this.getSlots() })
    })
  },
  watch: {
    availSlots: {
      handler (newVal, oldVal) {
        this.tick++
      }
    },
    deep: true
  },
  loading: {
    handler (newVal, oldVal) {
      this.tick++
    },
    deep: true
  }
}
</script>
<style>

</style>
