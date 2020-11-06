import { settings, select, templates, classNames } from '../settings.js'
import CartProduct from './CartProduct.js'
import { utils } from '../utils.js'

class Cart {
  constructor (element) {
    const thisCart = this
    thisCart.products = []

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee

    thisCart.getElements(element)
    thisCart.initActions(element)
  }

  getElements (element) {
    const thisCart = this
    thisCart.dom = {}

    thisCart.dom.wrapper = element
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger)
    thisCart.dom.productList = document.querySelector(select.cart.productList)
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee']

    for (const key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key])
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form)

    // Adress and telephone
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone)
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address)
  }

  initActions () {
    const thisCart = this

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive)
    })

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update()
    })

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct)
    })

    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault()
      thisCart.sendOrder()
    })
  }

  sendOrder () {
    const thisCart = this
    const url = settings.db.url + '/' + settings.db.order

    const payload = {
      address: 'test',
      adress: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: []
    }

    for (const product of thisCart.products) {
      const productData = product.getData()
      payload.products.push(productData)
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }

    fetch(url, options)
      .then(function (response) {
        return response.json()
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse)
      })
  }

  add (menuProduct) {
    const thisCart = this

    // Generate HTML based on template
    const generatedHTML = templates.cartProduct(menuProduct)

    // Create element using utils.createElementFromHTML
    const generatedDOM = utils.createDOMFromHTML(generatedHTML)

    //  add DOM elements to thisCar.dom.productList
    thisCart.dom.productList.appendChild(generatedDOM)

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM))

    thisCart.update()
  }

  update () {
    const thisCart = this
    thisCart.totalNumber = 0
    thisCart.subtotalPrice = 0

    for (const thisCartProduct of thisCart.products) {
      thisCart.subtotalPrice += thisCartProduct.price
      thisCart.totalNumber += thisCartProduct.amount
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee

    for (const key of thisCart.renderTotalsKeys) {
      for (const elem of thisCart.dom[key]) {
        // Total Price Reset - #ToDo
        if (thisCart.totalNumber === 0) {
          thisCart.totalPrice = 0
        }
        elem.innerHTML = thisCart[key]
      }
    }
  }

  remove (cartProduct) {
    const thisCart = this
    const index = thisCart.products.indexOf(cartProduct)

    thisCart.products.splice(index, 1)
    cartProduct.dom.wrapper.remove()
    thisCart.update()
  }
}

export default Cart
