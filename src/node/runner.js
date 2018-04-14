const childProcess = require('child_process')
const vld = require('./vld.js')
const util = require('util')
const path = require('path')
const ctx = require('axel')

function exitHandler(exit) {
  ctx.cursor.on()
  process.exit()
}
process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)
process.on('SIGUSR1', exitHandler)
process.on('SIGUSR2', exitHandler)
process.on('uncaughtException', exitHandler)


function pprint(data) {
  console.log(util.inspect(data, false, null, true))
}

function errprint(str) {
  console.log('\x1b[33m%s\x1b[0m', str)
}

function realPath(path_) {
  return path.join(__dirname, path_)
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

class Bot {
  constructor(language, file, team) {
    this.language = language
    this.file = file
    this.team = team
    if (this.language === 'python') {
      this.command = 'python3'
    } else {
      throw new Error('Invalid language')
    }
  }

  start() {
    this.process = childProcess.spawn(this.command, [
      realPath(this.file),
    ], {
      stdio: 'pipe',
      encoding: 'utf8'
    })
  }


  run(data) {
    return new Promise((resolve, reject) => {
      this.process.stdin.write(JSON.stringify(data) + '\n')
      this.process.stdout.once('data', (data) => {
        resolve(JSON.parse(data.toString()))
      })
      this.process.stderr.once('data', (data) => {
        reject(data)
      })
    })
  }
}

class Grid {
  constructor(size, tiles, teamColors) {
    this.size = size
    this.tiles = tiles
    this.defaultTile = tiles.empty
    this.generate()
    this.teams = Object.keys(teamColors)
    this.teamColors = teamColors
    this.units = this.teams.reduce((acc, val) => (
      { ...acc, [val]: {} }
    ), {})
  }

  generate() {
    this.grid = []
    for (let x = 0; x < this.size[0]; x++) {
      this.grid[x] = []
      for (let y = 0; y < this.size[1]; y++) {
        this.grid[x][y] = Object.assign({}, this.defaultTile)
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
    this.setEmpty(oldCoords)
    // console.log(unit)
    this.units[unit.team][unit.id] = newCoords
  }

  setEmpty(coords) {
    this.grid[coords[0]][coords[1]] = Object.assign({}, this.defaultTile)
  }

  deleteUnit(coords) {
    const unit = this.getTile(coords)
    delete this.units[unit.team][unit.id]
    this.setEmpty(coords)
  }

  createUnit(unitType, coords, team) {
    const id = generateId()
    this.grid[coords[0]][coords[1]] = { ...this.tiles[unitType], id, team }
    if (team) {
      if (!this.teams.includes(team)) {
        throw new Error('Team does not exist!')
      }
      this.units[team][id] = coords
    }
  }

  getCoords(id, team) {
    return this.units[team][id]
  }

  applyDirection(coords, direction) {
    switch (direction) {
      case 'left': {
        return [coords[0] - 1, coords[1]]
      }
      case 'right': {
        return [coords[0] + 1, coords[1]]
      }
      case 'up': {
        return [coords[0], coords[1] - 1]
      }
      case 'down': {
        return [coords[0], coords[1] + 1]
      }
    }
  }

  draw(ctx) {
    ctx.clear()
    for (let x = 0; x < this.size[0]; x++) {
      for (let y = 0; y < this.size[1]; y++) {
        const unit = this.getTile([x, y])
        if (unit.type !== 'empty') {
          const color = this.teamColors[unit.team][unit.unit]
          ctx.bg(color[0], color[1], color[2])
          ctx.box(x + 1, y + 1, 1, 1)
        }
      }
    }
    ctx.bg(0, 0, 0)
  }
}

const GRID_SIZE = [50, 50]
const UNIT_COMMANDS = {
  soldier: ['move']
}
const TILES = {
  empty: {
    type: 'empty',
  },
  soldier: {
    type: 'unit',
    unit: 'soldier',
    health: 10,
  }
}

const grid = new Grid(GRID_SIZE, TILES, {
  blue: {
    soldier: [64, 121, 140]
  },
  red: {
    soldier: [150, 122, 161]
  }
})
grid.createUnit('soldier', [10, 0], 'blue')
grid.createUnit('soldier', [49, 49], 'red')

const bots = [
  new Bot('python', 'sample-bot.py', 'blue'),
  new Bot('python', 'sample-bot.py', 'red'),
]

const DRAW = true
ctx.cursor.off()

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

for (let bot of bots) {
  bot.start()
}

async function run() {
  for (let bot of bots) {
    let commands
    try {
      commands = await bot.run({ grid: grid.grid, units: grid.units, team: bot.team })
    } catch (e) {
      throw e
    }
    pprint(commands)
    if (validator.validate(commands)) {
      for (let id in commands) {
        if (!grid.units[bot.team][id]) {
          throw new Error(`Invalid id "${id}"!`)
        }
        const coords = grid.getCoords(id, bot.team)
        const command = commands[id]
        const unit = grid.getTile(coords)
        if (grid.isEmpty(coords)) {
          throw new Error(`Coords "(${coords[0]}, ${coords[1]})" do not contain a unit!`)
        }
        if (!UNIT_COMMANDS[unit.unit].includes(command.type)) {
          throw new Error(`Command "${command}" does not exist for unit "${unit.unit}"!`)
        }

        switch (command.type) {
          case 'move': {
            let newCoords = grid.applyDirection(coords, command.direction)
            if (grid.isEmpty(newCoords)) {
              // console.log(newCoords)
              grid.moveUnit(coords, newCoords)
            }
            break
          }
          case 'attack': {
            let newCoords = grid.applyDirection(coords, command.direction)
            if (!grid.isEmpty(newCoords)) {
              const target = grid.getTile(newCoords)
              target.health -= 1
              if (target.health === 0) {
                grid.deleteUnit(newCoords)
              }
            }
            break
          }
        }
      }
    } else {
      errprint('nooo ')
      throw new Error('Data format is wrong!')
    }
  }
  if (DRAW) {
    grid.draw(ctx)
    setTimeout(run, 100)
  } else {
    run()
  }
}

run()
