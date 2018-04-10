class Validate {
	constructor(template) {
		this.template = this.prepare(template)
	}

	prepare(template, processArray=true) {
		let newTemplate
		if (template instanceof Array) {
			let result = template.map(val => this.prepare(val))
			if (processArray) {
				newTemplate = { oneOf: result }
			} else {
				newTemplate = result
			}
		} else if (typeof template === 'object') {
			newTemplate = {}
			for (let key in template) {
				newTemplate[key] = this.prepare(template[key], key !== 'exact')
			}
		} else {
			newTemplate = template
		}
		return newTemplate
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
				switch(key) {
					case 'type': {
						if (template.type === 'array') {
							success = success && val instanceof Array
						} else {
							success = success && typeof val === template.type
						}
						break
					}
					case 'validate': {
						success = success && template.validate(val)
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
					case 'exact': {
						if (typeof val !== 'object' || val instanceof Array) {
							success = false
							break
						}
						for (let tkey in template.exact) {
							success = success &&
								tkey in val &&
								this.validate(val[tkey], template[tkey])
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
	Validate,
	...['exact', 'oneOf'].reduce((acc, val) => (
		{ ...acc, [val]: createNestedFunc(val) }
	), {})
}
