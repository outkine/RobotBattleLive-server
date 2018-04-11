const child_process = require('child_process')
const vld = require('./vld.js')
const util = require('util')
const path = require('path')

function pprint(data) {
  console.log(util.inspect(data, false, null, true))
}

function errprint(str) {
  console.log('\x1b[33m%s\x1b[0m', str)
}

function realPath(path_) {
  return path.join(__dirname, path_)
}

function toCoords(string) {
  return string.split(',').map(char => parseInt(char))
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

class Bot {
  constructor(language, file, team) {
    this.language = language
    this.file = file
    this.team = team
    if (this.language == 'python') {
      this.command = 'python3'
    } else {
      throw new Error('Invalid language')
    }
  }

  run(data) {
    const result = child_process.spawnSync(this.command, [
      realPath(this.file),
   ], {
      input: JSON.stringify(data),
      stdio: 'pipe',
      encoding: 'utf8'
    }).output
    if (result[2]) {
      errprint(result[2])
      throw new Error('Bot error!')
    } else {
      return JSON.parse(result[1])
    }
  }
}

class Grid {
  constructor(size, defaultItem, teams) {
    this.size = size
    this.defaultItem = defaultItem
    this.generate()
    this.units = teams.reduce((acc, val) => (
      { ...acc, [val]: {} }
    ), {})
  }

  generate() {
    this.grid = []
    for (let x = 0; x < this.size[0]; x++) {
      this.grid[x] = []
      for (let y = 0; y < this.size[1]; y++) {
        this.grid[x][y] = Object.assign({}, this.defaultItem)
      }
    }
  }

  contains(coords) {
    return (
      coords[0] >= 0 &&
      coords[0] < this.size[0] &&
      coords[1] >= 0 &&
      coords[1] < this.size[1]
    )
  }

  getTile(coords) {
    return this.grid[coords[0]][coords[1]]
  }

  isEmpty(coords) {
    return this.contains(coords) && this.getTile(coords).type === 'empty'
  }

  moveUnit(oldCoords, newCoords) {
    const unit = this.getTile(oldCoords)
    this.grid[newCoords[0]][newCoords[1]] = unit
    this.grid[oldCoords[0]][oldCoords[1]] = Object.assign({}, this.defaultItem)
    this.units[unit.team][unit.id] = newCoords
  }

  createUnit(unit, coords, team) {
    const id = generateId()
    this.grid[coords[0]][coords[1]] = { ...unit, id }
    if (team) {
      this.units[team][id] = coords
    }
  }

  getCoords(id, team) {
    return this.units[team][id]
  }
}

GRID_SIZE = [10, 10]
UNIT_COMMANDS = {
  'soldier': ['move']
}

const grid = new Grid(GRID_SIZE, {
  type: 'empty'
}, ['blue', 'red'])
grid.createUnit({
  type: 'unit',
  unit: 'soldier',
  team: 'blue',
}, [0, 0], 'blue')
grid.createUnit({
  type: 'unit',
  unit: 'soldier',
  team: 'red',
}, [9, 9], 'red')

bots = [
  new Bot('python', 'sample-bot.py', 'blue'),
  new Bot('python', 'sample-bot.py', 'red'),
]

const validator = new vld.Validator({
  type: 'object',
  key: {
    type: 'string',
  },
  value: [
    vld.equal({
      type: ['move', 'attack'],
      direction: ['left', 'right', 'up', 'down'],
    }),
  ],
})


for (let i = 0; i < 100; i++) {
	for (let bot of bots) {
    commands = bot.run({ grid: grid.grid, units: grid.units, team: bot.team })
    pprint(commands)
    pprint(grid.units)
    if (validator.validate(commands)) {
      for (let id in commands) {
        if (!grid.units[bot.team][id]) {
          throw new Error(`Invalid id "${id}"!`)
        }
        const coords = grid.getCoords(id, bot.team)
        const command = commands[id]
        const unit = grid.getTile(coords)
        if (!UNIT_COMMANDS[unit.unit].includes(command.type)) {
          throw new Error(`Command ${command} does not exist for unit ${unit.unit}!`)
        }

        switch(command.type) {
          case 'move': {
            let newCoords
            switch(command.direction) {
              case 'left': {
                newCoords = [coords[0] - 1, coords[1]]
                break
              }
              case 'right': {
                newCoords = [coords[0] + 1, coords[1]]
                break
              }
              case 'up': {
                newCoords = [coords[0], coords[1] - 1]
                break
              }
              case 'down': {
                newCoords = [coords[0], coords[1] + 1]
                break
              }
            }
            if (grid.isEmpty(newCoords)) {
              grid.moveUnit(coords, newCoords)
            }
            break
          }
        }
      }
    } else {
      throw new Error(`Data format is wrong!`)
    }
  }
}
