import { settings, select, classNames } from './settings.js'
import Product from './components/Product.js'
import Booking from './components/Booking.js'
import Cart from './components/Cart.js'

const app = {
  initPages: function () {
    const thisApp = this
    thisApp.pages = document.querySelector(select.containerOf.pages).children
    thisApp.navLinks = document.querySelectorAll(select.nav.links)

    const idFromHash = window.location.hash.replace('#/', '')

    let pageMatchingHash = thisApp.pages[0].id

    for (const page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id
        break
      }
    }

    thisApp.activatePage(pageMatchingHash)
    // for (const page of thisApp.pages) {
    //   if (page.id === idFromHash) {
    //     thisApp.activatePage(idFromHash)
    //   } else {
    //     thisApp.activatePage(thisApp.pages[0].id)
    //   }
    // }

    for (const link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickElement = this
        event.preventDefault()

        // Get page if from href
        const id = clickElement.getAttribute('href').replace('#', '')

        // run thisApp.activatePage with that id
        thisApp.activatePage(id)

        // Change URL hash
        window.location.hash = `#/${id}`
      })
    }
  },

  activatePage: function (pageId) {
    const thisApp = this
    // add class "active" to matching pages, remove from non-matching
    for (const page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId)
    }
    // add class "active" to matching links, remove from non-matching
    for (const link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === `#${pageId}`
      )
    }
  },

  initBooking: function () {
    const thisApp = this
    thisApp.bookingElement = document.querySelector(select.containerOf.booking)
    thisApp.booking = new Booking(thisApp.bookingElement)
  },

  initMenu: function () {
    const thisApp = this
    // console.log('thisApp.data: ',thisApp.data);

    for (const productData in thisApp.data.products) {
      // eslint-disable-next-line no-new
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData])
    }
  },

  initData: function () {
    const thisApp = this
    thisApp.data = {}

    const url = settings.db.url + '/' + settings.db.product

    fetch(url)
      .then(function (rawResponde) {
        return rawResponde.json()
      })
      .then(function (parsedResponde) {
        // save parsedResponde as thisApp.data.products
        thisApp.data.products = parsedResponde

        // execute initMenu method
        thisApp.initMenu()
      })
  },

  initCart: function () {
    const thisApp = this

    const cartElem = document.querySelector(select.containerOf.cart)
    thisApp.cart = new Cart(cartElem)

    thisApp.productList = document.querySelector(select.containerOf.menu)

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product)
    })
  },

  init: function () {
    const thisApp = this
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages()
    thisApp.initData()
    thisApp.initCart()
    thisApp.initBooking()
  }
}
app.init()
