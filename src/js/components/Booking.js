import { templates, select, settings } from '../settings.js'
import { utils } from '../utils.js'
import AmountWidget from './AmountWidget.js'
import DatePicker from './DatePicker.js'
import HourPicker from './HourPicker.js'

class Booking {
  constructor (element) {
    const thisBooking = this
    thisBooking.render(element)
    thisBooking.initWidgets()
    thisBooking.getData()
  }

  getData () {
    const thisBooking = this
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    }

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking.join('&')}`,
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${settings.db.event}?${params.eventsRepeat.join('&')}`
    }
    console.log(urls)
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0]
        const eventsCurrentResponse = allResponses[1]
        const eventsRepeatResponse = allResponses[2]
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ])
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings)
        console.log(eventsCurrent)
        console.log(eventsRepeat)
      })
  }

  render (element) {
    const thisBooking = this

    // Generate HTML based on template
    const generatedHTML = templates.bookingWidget()

    // Create empty object
    thisBooking.dom = {}

    // Add wrapper property to the object
    thisBooking.dom.wrapper = element

    // Change content of the wrapper to generatedHTML template
    thisBooking.dom.wrapper.innerHTML = generatedHTML

    // Save single element into correct property
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount)
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount)
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper)
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper)
  }

  initWidgets () {
    const thisBooking = this
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount)
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount)
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker)
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker)
  }
}

export default Booking
