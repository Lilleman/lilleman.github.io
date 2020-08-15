Maze.Algorithms.GrowingTree = class extends Algorithm {
  QUEUE = 4096

  constructor(maze, options) {
    super(maze)
    this.cells = []
    this.state = 0
    let d = options.input || "random"
    this.script = new Maze.Algorithms.GrowingTree.Script(d, this.rand)
  }

  inQueue(x, y) {
    return this.maze.isSet(x, y, this.QUEUE)
  }

  enqueue(x, y) {
    this.maze.carve(x, y, this.QUEUE)
    return this.cells.push({x: x, y: y})
  }

  nextCell() {
    return this.script.nextIndex(this.cells.length)
  }

  startStep() {
    let x = this.rand.nextInteger(this.maze.width)
    let y = this.rand.nextInteger(this.maze.height)
    this.enqueue(x, y)
    this.updateAt(x, y)
    return this.state = 1
  }

  runStep() {
    let self = this;
    let index = this.nextCell()
    let cell = this.cells[index]

    let dirs = this.rand.randomDirections()
    for (let i = 0; i < dirs.length; i++) {
      let direction = dirs[i]
      let nx = cell.x + Direction.dx[direction]
      let ny = cell.y + Direction.dy[direction]

      if (this.maze.isValid(nx, ny)) {
        if (this.maze.isBlank(nx, ny)) {
          this.maze.carve(cell.x, cell.y, direction)
          this.maze.carve(nx, ny, Direction.opposite[direction])
          this.enqueue(nx, ny)
          this.updateAt(cell.x, cell.y)
          this.updateAt(nx, ny)
          return
        } else {
          if (this.canWeave(direction, nx, ny)) {
            this.performWeave(direction, cell.x, cell.y, (toX, toY) => self.enqueue(toX, toY))
            return
          }
        }
      }
    }

    this.cells.splice(index, 1)
    this.maze.uncarve(cell.x, cell.y, this.QUEUE)
    return this.updateAt(cell.x, cell.y)
  }

  step() {
    switch (this.state) {
      case 0:
        this.startStep()
        break
      case 1:
        this.runStep()
    }
    return this.cells.length > 0
  }
}

Maze.Algorithms.GrowingTree.Script = class {
  constructor(input, rand) {
    this.rand = rand
    this.commands = []
    let ref = input.split(/;|\r?\n/)
    for (let i = 0; i < ref.length; i++) {
      let totalWeight = 0
      let parts = []
      let ref1 = ref[i].split(/,/)
      for (let j = 0; j < ref1.length; j++) {
        let name = ref1[j].split(/:/)[0]
        let weight = ref1[j].split(/:/)[1]
        totalWeight += parseInt(weight != null ? weight : 100)
        parts.push({ name: name.replace(/\s/, ""), weight: totalWeight })
      }
      this.commands.push({ total: totalWeight, parts: parts })
    }
    this.current = 0
  }

  nextIndex(ceil) {
    let command = this.commands[this.current]
    this.current = (this.current + 1) % this.commands.length

    let target = this.rand.nextInteger(command.total)
    for (let i = 0; i < command.parts.length; i++) {
      let part = command.parts[i]
      if (target < part.weight) {
        switch (part.name) {
          case "random":
            return this.rand.nextInteger(ceil)
          case "newest":
            return ceil - 1
          case "middle":
            return Math.floor(ceil / 2)
          case "oldest":
            return 0
          default:
            throw "invalid weight key `" + part.name + "'"
        }
      }
    }
  }
}