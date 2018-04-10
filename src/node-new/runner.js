const child_process = require('child_process')
const validate = require('./validate.js')
const util = require('util')
// import os.path
// import subprocess
// import json
// import sys

// def real_path(file):
// return os.path.join(sys.path[0], file)

function generate_grid(default_item, size) {
  const grid = []
  for (let x = 0; x < size[0]; x++) {
    grid[x] = []
    for (let y = 0; y < size[1]; y++) {
      grid[x][y] = Object.assign({}, default_item)
    }
  }
  return grid
}

// def assertm(bool_, message):
// if !bool_:
// 	raise Exception(message)

// def verify_type(data, type_):
// assertm(type(data) == type_, 'Invalid data format.')

// def verify_in_grid(coords):
// assertm(
// 	(
// 		coords[0] >= 0 and
// 			coords[0] < GRID_SIZE[0] and
// 			coords[1] >= 0 and
// 			coords[1] < GRID_SIZE[1]
// ),
// 	'Coords "{}" not in grid'.format(coords)
// 	)

// def verify_key(dict_, key):
// assertm(
// 	key in dict_,
// 	'Key "{}" not found'.format(key)
// )

class Bot {
  constructor(language, file) {
    this.language = language
    this.file = file
    if (this.language == 'python') {
      this.command = 'python3'
    } else {
      throw new Error('Invalid language')
    }
  }

  run(data) {
    return child_process.run(
      `${self.command} ${real_path(this.file)} < ${JSON.stringify(data)}`
    )
  }
}


GRID_SIZE = [10, 10]
UNIT_COMMANDS = {
  'soldier': ['move']
}

grid = generate_grid(
  {
    type: 'plain',
    id: '32a12',
  },
  GRID_SIZE,
)
// console.log(grid)
bots = [
  new Bot('python', 'sample-bot.py'),
  new Bot('python', 'sample-bot.py'),
]


const validator = new validate.Validate({
  type: 'object',
  key: {
    type: 'string',
    validate: coords => grid.reduce((acc, val) => (
      val.reduce((acc, val) => (
        acc || val.id === id
      ), acc)
    ), false)
  },
  value: {
    validate: command => {
      const coords = command.split(',').map(char => parseInt(char))
      command.unit = grid[coords[0]][coords[1]]
      return command.unit in UNIT_COMMANDS &&
             UNIT_COMMANDS[command.unit].includes(command.type)
    },
    oneOf: [
      validate.exact({
        type: ['move', 'attack'],
        direction: ['left', 'right', 'up', 'down'],
      }),
    ]
  }
})

console.log(validator)

// console.log(util.inspect(validator.template, false, null, true))

console.log(validator.validate({
  '32a12': {
    type: 'move',
    direction: 'left',
  }
}))


for (let i = 0; i < 10; i++) {
	for (let bot of bots) {
		commands = bot.run(grid)

    for (let id of commands) {

    }
  }
}
