class Validator {
  constructor(template) {
    this.template = template
  }

  validate(val, template=this.template) {
    let success = true
    if (template instanceof Array) {
      let success_ = false
      for (let tval of template) {
        if (!this.validate(val, tval)) {
          success_ = true
        }
      }
      success = success && success_
    } else if (typeof template !== 'object') {
      success = success && val === template
    } else {
      for (let key in template) {
        switch (key) {
          case 'type': {
            if (template.type === 'array') {
              success = success && val instanceof Array
            } else {
              success = success && typeof val === template.type
            }
            break
          }
          case 'regex': {
            success = success &&
              typeof val === 'string' &&
              template.regex.test(val)
            break
          }
          case 'check': {
            success = success && template.check(val)
            break
          }
          case 'value': {
            let vals
            if (val instanceof Array) {
              vals = val
            } else if (typeof val === 'object') {
              vals = Object.values(val)
            } else {
              success = false
              break
            }
            for (let val_ of vals) {
              success = success &&
                this.validate(val_, template.value)
            }
            break
          }
          case 'key': {
            if (typeof val !== 'object' || val instanceof Array) {
              success = false
              break
            }
            for (let key in val) {
              success = success &&
                this.validate(key, template.key)
            }
            break
          }
          case 'equal': {
            if (template.equal instanceof Array) {
              for (let i = 0; i < template.equal.length; i++) {
                success = success &&
                  val instanceof Array &&
                  this.validate(val[i], template[i])
              }
            } else if (typeof template.equal === 'object') {
              for (let tkey in template.equal) {
                success = success &&
                  typeof val === 'object' &&
                  this.validate(val[tkey], template[tkey])
              }
            } else {
              success = success &&
                this.validate(val, template)
            }
            break
          }
        }
      }
    }
    return success
  }
}

function createNestedFunc(name) {
  return (val) => ({
    [name]: val
  })
}

module.exports = {
  Validator,
  ...['equal'].reduce((acc, val) => (
    { ...acc, [val]: createNestedFunc(val) }
  ), {})
}
