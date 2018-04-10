const child_process = require('child_process')
const validate = require('./validate.js')
const util = require('util')

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
    validate: id => grid.reduce((acc, val) => (
      val.reduce((acc, val) => (
        acc || val.id === id
      ), acc)
    ), false)
  },
  value: [
    validate.exact({
      type: ['move', 'attack'],
      direction: ['left', 'right', 'up', 'down'],
    }),
  ]
})

console.log(validator.validate({
  '32a12': {
    type: 'move',
    direction: 'left',
  }
}))
