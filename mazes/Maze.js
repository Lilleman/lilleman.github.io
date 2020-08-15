class Maze {
  static Algorithms = {}

  constructor(width, height, algorithm, options) {
    this.width = width
    this.height = height
    options = (options == null) ? {} : options
    this.grid = new Grid(this.width, this.height)
    this.rand = options.rng || new MersenneTwister(options.seed)
    this.isWeave = options.weave
    
    if (this.rand.randomElement == null) {
      this.rand.randomElement = function(list) {
        return list[this.nextInteger(list.length)]
      }
      this.rand.removeRandomElement = function(list) {
        let results = list.splice(this.nextInteger(list.length), 1)
        if (results) {
          return results[0]
        }
      }
      this.rand.randomizeList = function(list) {
        let i = list.length - 1
        while (i > 0) {
          let j = this.nextInteger(i + 1)
          let tmp = list[j]
          list[j] = list[i]
          list[i] = tmp
          i--
        }
        return list
      }
      this.rand.randomDirections = function() {
        return this.randomizeList(Direction.List.slice(0))
      }
    }
    
    this.algorithm = new algorithm(this, options)
  }

  onUpdate = (fn) => this.algorithm.onUpdate(fn)
  onEvent = (fn) => this.algorithm.onEvent(fn)

  generate() {
    while (this.step()) {}
  }

  step() {
    return this.algorithm.step()
  }

  isEast = (x, y) => this.grid.isMarked(x, y, Direction.E)
  isWest = (x, y) => this.grid.isMarked(x, y, Direction.W)
  isNorth = (x, y) => this.grid.isMarked(x, y, Direction.N)
  isSouth = (x, y) => this.grid.isMarked(x, y, Direction.S)
  isUnder = (x, y) => this.grid.isMarked(x, y, Direction.U)
  isValid = (x, y) => (0 <= x && x < this.width) && (0 <= y && y < this.height)
  carve = (x, y, dir) => this.grid.mark(x, y, dir)
  uncarve = (x, y, dir) => this.grid.clear(x, y, dir)
  isSet = (x, y, dir) => this.grid.isMarked(x, y, dir)
  isBlank = (x, y) => this.grid.at(x, y) === 0
  isPerpendicular = (x, y, dir) => (this.grid.at(x, y) & Direction.Mask) === Direction.cross[dir]
}

const Direction = {
  N: 0x01,
  S: 0x02,
  E: 0x04,
  W: 0x08,
  U: 0x10,
  Mask: 0x01|0x02|0x04|0x08|0x10,
  List: [1, 2, 4, 8],
  dx: { 1: 0, 2: 0, 4: 1, 8: -1 },
  dy: { 1: -1, 2: 1, 4: 0, 8: 0 },
  opposite: { 1: 2, 2: 1, 4: 8, 8: 4 },
  cross: { 1: 4|8, 2: 4|8, 4: 1|2, 8: 1|2 }
}

class Grid {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.data = Array(height).fill(0).map(x => Array(width).fill(0))
  }

  at = (x, y) => this.data[y][x]
  mark = (x, y, bits) => this.data[y][x] |= bits
  clear = (x, y, bits) => this.data[y][x] &= ~bits
  isMarked = (x, y, bits) => (this.data[y][x] & bits) === bits
}