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

  async login () {
    console.log("try log in")
    const request = axios.CancelToken.source()
    this.requests.push(request)
    await this.client
      .post(
        "https://www.hkfc.com/Umbraco/api/Membership/Login",
        qs.stringify({
          username: this.username,
          password: this.password,
        }),
        { cancelToken: request.token }
      )
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    await this.getToken()
  }

  async getToken () {
    console.log("try get token")
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const response = await this.client
      .get(
        `https://www.hkfc.com/facilities-booking/booking?facility=${this.facility}`,
        { cancelToken: request.token }
      )
    this.token = response.data.match(/var token = "([0-9a-zA-Z]+)"/)[1]
    this.isLoggedIn = true
    console.log(this.token)
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
  }

  async getDates () {
    console.log("try get dates")
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const response = await this.client.get(
      `https://www.hkfc.com/facilitiesBooking/avaliableDates/get?Code=${this.facility}&token=${this.token}`,
      { cancelToken: request.token }
    )
    const dates = []
    for (const date of response.data.Data.AvailableDates) {
      dates.push(date.DateId)
    }
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    return dates
    // return [str(d['DateId']) for d in response.json()['Data']['AvailableDates']]
  }

  async getAvailSlots (date) {
    console.log("try get slots")
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const response = await this.client.get(
      `https://www.hkfc.com/facilitiesBooking/avaliableTime/get?Code=${this.facility}&DateId=${date}&token=${this.token}`,
      { cancelToken: request.token }
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
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    return availSlots
  }

  async bookCourt (court, date, timeslot) {
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const formdata = qs.stringify({
      code: this.facility,
      element: court,
      date: date,
      time: timeslot,
      hold: false,
      token: this.token,
    })
    console.log(formdata)
    const response = await this.client.post(
      "https://www.hkfc.com/facilitiesBooking/booking/create",
      formdata,
      { cancelToken: request.token }
    )
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    return response.data
  }

  async getBookings (startDate, endDate) {
    const request = axios.CancelToken.source()
    this.requests.push(request)
    const response = await this.client.get(
      `https://www.hkfc.com/facilitiesBooking/booking/history?startDate=${startDate}&endDate=${endDate}`,
      { cancelToken: request.token }
    )
    this.requests = this.requests.filter(function (value, index, arr) {
      return value === request
    })
    return response.data.Data
  }

  cancelRequests (msg = "") {
    this.requests.forEach((r) => { r.cancel(msg) })
  }
}
export default FootballClubBooker
