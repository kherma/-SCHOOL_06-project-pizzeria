import { templates } from '../settings.js'

class Home {
  constructor (element) {
    const thisHome = this
    thisHome.render(element)
    thisHome.hideElements()
  }

  hideElements () {
    ['hashchange', 'load'].forEach(elem =>
      window.addEventListener(elem, function (event) {
        ['#cart', '.main-nav'].forEach(selector => {
          document.querySelector(selector).style.transition = 'all 0.2s ease-in'
          document.querySelector(selector).style.opacity = window.location.hash === '#/home' ? 0 : 1
          document.querySelector(selector).style.visibility = window.location.hash === '#/home' ? 'hidden' : 'visible'
        })
      })
    )
  }

  render (element) {
    const thisHome = this

    // Generate HTML based on template
    const generatedHTML = templates.homeWidget()

    // Create empty object
    thisHome.dom = {}

    // Add wrapper property to the object
    thisHome.dom.wrapper = element

    // Change content of the wrapper to generatedHTML template
    thisHome.dom.wrapper.innerHTML = generatedHTML

    // Save single element into correct property
  }
}

export default Home
