import FootballClubBooker from "@/js/session"

let interval

console.log("start background job now")
interval = setInterval(checkScheduleAndBook, 30000)

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("pause background job now")
  clearInterval(interval)
})

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "popup") {
    port.onDisconnect.addListener(function () {
      console.log("resume background job now")
      interval = setInterval(checkScheduleAndBook, 30000)
    })
  }
})

function checkScheduleAndBook () {
  chrome.storage.local.get("bookingSchedule", (res) => {
    if ("bookingSchedule" in res) {
      const bookingSchedule = { ...res.bookingSchedule }
      chrome.storage.local.get("login", (res) => {
        const booker = new FootballClubBooker(res.login[0].username, res.login[0].password)
        booker.loginWithRetry().then(() => {
          for (const date in bookingSchedule) {
            for (const timeslot in bookingSchedule[date]) {
              if (bookingSchedule[date][timeslot]) {
                console.log(date, timeslot)
                booker.getAvailSlots(date).then(
                  availSlots => {
                    for (const slot of availSlots) {
                      if (slot.slot === timeslot && slot.isAvailable) {
                        console.log(`try to book ${slot.availableCourts[0]} ${timeslot} on ${date}`)
                        booker.bookCourt(slot.availableCourts[0], date, timeslot).then(
                          (respData) => {
                            bookingSchedule[date][timeslot] = false
                            chrome.storage.local.set({ bookingSchedule: bookingSchedule })
                          }
                        )
                      }
                    }
                  }
                )
                // if (2 === 1) {
                //   bookingSchedule[timeslot][date] = false
                //   chrome.storage.local.set({ bookingSchedule: bookingSchedule })
                // }
              }
            }
          }
        })
      })
    }
  })
}
