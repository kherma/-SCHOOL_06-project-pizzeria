/* global Handlebars, dataSource */
/* eslint-disable no-prototype-builtins */
/* eslint-disable eqeqeq */

export const utils = {} // eslint-disable-line no-unused-vars

utils.createDOMFromHTML = function (htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()
  return div.firstChild
}

utils.createPropIfUndefined = function (obj, key, value = []) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = value
  }
}

utils.serializeFormToObject = function (form) {
  const output = {}
  if (typeof form === 'object' && form.nodeName == 'FORM') {
    for (const field of form.elements) {
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          for (const option of field.options) {
            if (option.selected) {
              utils.createPropIfUndefined(output, field.name)
              output[field.name].push(option.value)
            }
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          utils.createPropIfUndefined(output, field.name)
          output[field.name].push(field.value)
        }
      }
    }
  }
  return output
}

utils.convertDataSourceToDbJson = function () {
  const productJson = []
  for (const key in dataSource.products) {
    productJson.push(Object.assign({ id: key }, dataSource.products[key]))
  }

  console.log(JSON.stringify({ product: productJson, order: [] }, null, '  '))
}

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this)
})

Handlebars.registerHelper('joinValues', function (input, options) {
  return Object.values(input).join(options.fn(this))
})
