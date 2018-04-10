const child_process = require('child_process')
const vld = require('./vld.js')
const util = require('util')

function generateGrid(default_item, size) {
  const grid = []
  for (let x = 0; x < size[0]; x++) {
    grid[x] = []
    for (let y = 0; y < size[1]; y++) {
      grid[x][y] = Object.assign({}, default_item)
    }
  }
  return grid
}

function inGrid(coords) {
  return (
    coords[0] >= 0 &&
    coords[0] < GRID_SIZE[0] &&
    coords[1] >= 0 &&
    coords[1] < GRID_SIZE[1]
  )
}

function toCoords(string) {
  return string.split(',').map(char => parseInt(char))
}

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


GRID_SIZE = [100, 100]
UNIT_COMMANDS = {
  'soldier': ['move']
}

grid = generateGrid(
  {
    type: 'plain',
  },
  GRID_SIZE,
)
grid[10][10] = {
  unit: 'soldier',
}
// console.log(grid)
bots = [
  new Bot('python', 'sample-bot.py'),
  new Bot('python', 'sample-bot.py'),
]


const validator = new vld.Validator({
  type: 'object',
  key: {
    type: 'string',
    regex: /^\d*,\d*$/g,
    check: coords => inGrid(toCoords(coords))
  },
  value: [
    vld.equal({
      type: ['move', 'attack'],
      direction: ['left', 'right', 'up', 'down'],
    }),
  ],
  check: commands => {
    let success = true
    for (let key in commands) {
      const command = commands[key]
      const coords = toCoords(key)
      command.unit = grid[coords[0]][coords[1]].unit
      success = success &&
        command.unit in UNIT_COMMANDS &&
        UNIT_COMMANDS[command.unit].includes(command.type)
    }
    return success
  }
})

console.log(util.inspect(validator.template, false, null, true))

console.log(validator.validate({
  '10,10': 1
}))


// for (let i = 0; i < 10; i++) {
// 	for (let bot of bots) {
// 		commands = bot.run(grid)

//     for (let id of commands) {

//     }
//   }
// }
