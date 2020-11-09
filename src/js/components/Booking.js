import { templates, select } from '../settings.js'
import AmountWidget from './AmountWidget.js'
import DatePicker from './DatePicker.js'

class Booking {
  constructor (element) {
    const thisBooking = this
    thisBooking.render(element)
    thisBooking.initWidgets()
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
  }

  initWidgets () {
    const thisBooking = this
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount)
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount)
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker)
  }
}

export default Booking
