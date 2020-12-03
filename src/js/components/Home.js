import { templates } from '../settings.js'

class Home {
  constructor (element) {
    const thisHome = this
    thisHome.render(element)
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
