// const axios = require("axios").default;
// const { CookieJar } = require("tough-cookie");
// const { wrapper } = require("axios-cookiejar-support");
// const qs = require("qs");

import axios from "axios"
import qs from "qs"

import { CookieJar } from "tough-cookie"
import { wrapper } from "axios-cookiejar-support"

function timeout (ms) {
  console.log(`sleep for ${ms}`)
  return new Promise(resolve => setTimeout(resolve, ms))
}

class FootballClubBooker {
  constructor (username, password, facility = "TEN") {
    this.facility = facility
    this.username = username
    this.password = password
    const jar = new CookieJar()
    this.client = wrapper(axios.create({ jar }))
    this.token = null
    this.isLoggedIn = false
    this.requests = []
  }

  async loginWithRetry () {
    try {
      await this.login()
    } catch (err) {
      await timeout(2000)
      await this.login()
    }
  }

  async get (url) {
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const resp = await this.client.get(url, { cancelToken: request.token })
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    return resp
  }

  async post (url, data) {
    const resp = await this.client
      .post(
        url,
        qs.stringify(data),
      )
    return resp
  }

  async login () {
    console.log("try log in")
    await this.post(
      "https://www.hkfc.com/Umbraco/api/Membership/Login",
      {
        username: this.username,
        password: this.password,
      },
    )
    await this.getToken()
  }

  async getToken () {
    console.log("try get token")
    const response = await this.get(`https://www.hkfc.com/facilities-booking/booking?facility=${this.facility}`)
    this.token = response.data.match(/var token = "([0-9a-zA-Z]+)"/)[1]
    this.isLoggedIn = true
  }

  async getDates () {
    console.log("try get dates")
    const response = await this.get(
      `https://www.hkfc.com/facilitiesBooking/avaliableDates/get?Code=${this.facility}&token=${this.token}`,
    )
    const dates = []
    for (const date of response.data.Data.AvailableDates) {
      dates.push(date.DateId)
    }
    return dates
  }

  async getAvailSlots (date) {
    console.log("try get slots")
    const response = await this.get(
      `https://www.hkfc.com/facilitiesBooking/avaliableTime/get?Code=${this.facility}&DateId=${date}&token=${this.token}`,
    )
    const availSlots = []
    for (const time of response.data.Data.AvailableTime) {
      let isAvail = false
      const availCourts = []
      for (const court of time.Courts) {
        if (court.Status === "A") {
          isAvail = true
          availCourts.push(court.ElementCode)
        }
      }
      availSlots.push({
        slot: time.TimeSlot,
        isAvailable: isAvail,
        availableCourts: availCourts,
      })
    }
    return availSlots
  }

  async bookCourt (court, date, timeslot) {
    const data = {
      code: this.facility,
      element: court,
      date: date,
      time: timeslot,
      hold: false,
      token: this.token,
    }
    const response = await this.post(
      "https://www.hkfc.com/facilitiesBooking/booking/create",
      data,
    )
    return response.data
  }

  async cancelBooking (bookingId) {
    const data = {
      bookingId: bookingId,
      token: this.token
    }
    const url = "https://www.hkfc.com/facilitiesBooking/booking/cancel"
    const resp = await this.post(url, data)
    return resp
  }

  async getBookings (startDate, endDate) {
    console.log("try get current bookings")
    const response = await this.get(
      `https://www.hkfc.com/facilitiesBooking/booking/history?startDate=${startDate}&endDate=${endDate}`,
    )
    return response.data.Data
  }

  cancelRequests (msg = "") {
    this.requests.forEach((r) => { r.cancel(msg) })
  }
}
export default FootballClubBooker
