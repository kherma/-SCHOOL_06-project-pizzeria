import { templates, select, settings, classNames } from '../settings.js'
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
    thisBooking.selectTable()
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
        // console.log(bookings)
        // console.log(eventsCurrent)
        // console.log(eventsRepeat)
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
      })
  }

  parseData (bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this
    thisBooking.booked = {}
    for (const item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    const minDate = thisBooking.datePicker.minDate
    const maxDate = thisBooking.datePicker.maxDate
    for (const item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
        }
      }
    }

    for (const item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }
    thisBooking.updateDOM()
  }

  makeBooked (date, hour, duration, table) {
    const thisBooking = this
    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {}
    }

    const startHour = utils.hourToNumber(hour)

    for (let i = startHour; i < startHour + duration; i += 0.5) {
      if (typeof thisBooking.booked[date][i] === 'undefined') {
        thisBooking.booked[date][i] = []
      }
      thisBooking.booked[date][i].push(table)
    }
  }

  updateDOM () {
    const thisBooking = this
    thisBooking.date = thisBooking.datePicker.value
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value)

    let allAvailable = false

    if (typeof thisBooking.booked[thisBooking.date] === 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined') {
      allAvailable = true
    }

    for (const table of thisBooking.dom.tables) {
      const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute))

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked)
      } else {
        table.classList.remove(classNames.booking.tableBooked)
      }
    }
    thisBooking.showOccupationOnSlider(thisBooking.datePicker.value)
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables)
    thisBooking.dom.phone = document.querySelector(select.booking.phoneBooking)
    thisBooking.dom.address = document.querySelector(select.booking.addressBooking)
    thisBooking.dom.starters = []
  }

  showOccupationOnSlider (date) {
    const thisBooking = this
    const gradientString = []
    const gradientColors = []
    thisBooking.occupation = {}

    for (let i = 12; i <= 24; i += 0.5) {
      if (thisBooking.booked[date][i]) {
        gradientString.push(thisBooking.booked[date][i].length)
      } else {
        gradientString.push(1)
      }
    }

    for (const [i, elem] of gradientString.entries()) {
      if (elem === 3) {
        gradientColors.push(`red ${i * 4}%, red ${i * 4 + 4}%`)
      }
      if (elem === 2) {
        gradientColors.push(`yellow ${i * 4}%, yellow ${i * 4 + 4}%`)
      }
      if (elem === 1) {
        gradientColors.push(`green ${i * 4}%, green ${i * 4 + 4}%`)
      }
    }

    document.querySelector('.rangeSlider').style.backgroundImage = `linear-gradient(90deg, ${gradientColors.join(', ')})`
  }

  selectTable () {
    const thisBooking = this

    const tables = document.querySelectorAll(select.booking.tables)

    // Deselect table on hour change
    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      tables.forEach(table => table.classList.remove(classNames.booking.selected))
    })

    // Deselect table on date change
    thisBooking.dom.datePicker.addEventListener('updated', function () {
      tables.forEach(table => table.classList.remove(classNames.booking.selected))
    })

    // Select clicked table
    tables.forEach(table => table.addEventListener('click', function (event) {
      if (!event.target.classList.contains(classNames.booking.tableBooked)) {
        tables.forEach(table => table.classList.remove('selected'))
        event.target.classList.add(classNames.booking.selected)
        const targetTable = event.target.dataset.table
        thisBooking.dom.selectTable = Number(targetTable)
      }
    }))
  }

  checkIfTableBooked (tableNum = false) {
    const thisBooking = this
    if (!tableNum) {
      console.log('Choose the table first!')
      return false
    }
    const table = tableNum
    const date = thisBooking.datePicker.value
    const time = utils.hourToNumber(thisBooking.hourPicker.value)
    const hoursAmount = thisBooking.hoursAmount.value
    for (let i = time; i <= time + hoursAmount; i += 0.5) {
      if (thisBooking.booked[date][i]) {
        if (thisBooking.booked[date][i].includes(table)) {
          console.log(`Table ${table} booked at ${i}`)
          return false
        }
      }
    }
    return true
  }

  sendReservation () {
    const thisBooking = this
    const url = settings.db.url + '/' + settings.db.booking
    document.getElementsByName('starter').forEach(starter => starter.checked ? thisBooking.dom.starters.push(starter.value) : '')

    const reservation = {
      adress: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.dom.selectTable,
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.dom.starters
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservation)
    }

    fetch(url, options)
      .then(function (response) {
        return response.json()
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse)
      })
  }

  initWidgets () {
    const thisBooking = this
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount)
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount)
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker)
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker)
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM()
    })
    document.querySelector('.btn-submit-booking').addEventListener('click', function () {
      if (!thisBooking.checkIfTableBooked(thisBooking.dom.selectTable)) return
      console.log('Sent')
      thisBooking.sendReservation()
      thisBooking.getData()
      thisBooking.updateDOM()
    })
  }
}

export default Booking
