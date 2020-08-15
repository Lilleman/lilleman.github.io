Maze.Algorithms.Eller = class extends Algorithm {
  IN = 4096
  HORIZONTAL = 0
  VERTICAL = 1

  constructor(maze) {

    super(maze)
    this.state = new Maze.Algorithms.Eller.State(this.maze.width).populate()
    this.row = 0
    this.pending = true

    this.initializeRow()
  }

  initializeRow() {
    this.column = 0
    return this.mode = this.HORIZONTAL
  }

  isFinal = () => this.row + 1 === this.maze.height

  isIn = (x, y) => this.maze.isValid(x, y) && this.maze.isSet(x, y, this.IN)
  isCurrent = (x, y) => this.column === x && this.row === y

  horizontalStep() {
    if (!this.state.isSame(this.column, this.column + 1) && (this.isFinal() || this.rand.nextBoolean())) {
      this.state.merge(this.column, this.column + 1)

      this.maze.carve(this.column, this.row, Direction.E)
      this.updateAt(this.column, this.row)

      this.maze.carve(this.column + 1, this.row, Direction.W)
      this.updateAt(this.column + 1, this.row)
    } else {
      if (this.maze.isBlank(this.column, this.row)) {
        this.maze.carve(this.column, this.row, this.IN)
        this.updateAt(this.column, this.row)
      }
    }

    this.column += 1

    if (this.column > 0) {
      this.updateAt(this.column - 1, this.row)
    }
    this.updateAt(this.column, this.row)

    if (this.column + 1 >= this.maze.width) {
      if (this.maze.isBlank(this.column, this.row)) {
        this.maze.carve(this.column, this.row, this.IN)
        this.updateAt(this.column, this.row)
      }

      if (this.isFinal()) {
        this.pending = false
        let oldColumn = this.column
        this.column = null
        return this.updateAt(oldColumn, this.row)
      } else {
        this.mode = this.VERTICAL
        this.next_state = this.state.next()
        this.verticals = this.computeVerticals()
        return this.eventAt(0, this.row)
      }
    }
  }

  computeVerticals() {
    let verts = []

    let rand = this.rand;
    this.state.foreach((id, set) => {
      let countFromThisSet = 1 + rand.nextInteger(set.length - 1)
      let cellsToConnect = rand.randomizeList(set).slice(0, countFromThisSet)
      verts = verts.concat(cellsToConnect)
    })

    return verts.sort((a, b) => a - b)
  }

  verticalStep() {
    if (this.verticals.length === 0) {
      this.state = this.next_state.populate()
      this.row += 1
      let oldColumn = this.column
      this.initializeRow()
      this.eventAt(0, this.row)

      this.updateAt(oldColumn, this.row - 1)
      return this.updateAt(this.column, this.row)
    } else {
      let oldColumn = this.column
      this.column = this.verticals.pop()
      this.updateAt(oldColumn, this.row)

      this.next_state.add(this.column, this.state.setFor(this.column))

      this.maze.carve(this.column, this.row, Direction.S)
      this.updateAt(this.column, this.row)

      this.maze.carve(this.column, this.row + 1, Direction.N)
      return this.updateAt(this.column, this.row + 1)
    }
  }

  step() {
    switch (this.mode) {
      case this.HORIZONTAL:
        this.horizontalStep()
        break
      case this.VERTICAL:
        this.verticalStep()
    }
    return this.pending
  }
}

Maze.Algorithms.Eller.State = class {
  constructor(width, counter = 0) {
    this.width = width
    this.counter = counter
    this.sets = {}
    this.cells = []
  }

  next() {
    return new Maze.Algorithms.Eller.State(this.width, this.counter)
  }

  populate() {
    let cell = 0
    while (cell < this.width) {
      if (!this.cells[cell]) {
        let set = (this.counter += 1)
        if (this.sets[set] === undefined || this.sets[set] === null) {
          this.sets[set] = []
        }
        this.sets[set].push(cell)
        this.cells[cell] = set
      }
      cell += 1
    }
    return this
  }

  merge(sink, target) {
    let sink_set = this.cells[sink]
    let target_set = this.cells[target]

    this.sets[sink_set] = this.sets[sink_set].concat(this.sets[target_set])
    for (let i = 0; i < this.sets[target_set].length; i++) {
      let cell = this.sets[target_set][i]
      this.cells[cell] = sink_set
    }
    delete this.sets[target_set]
  }

  isSame = (a, b) => this.cells[a] === this.cells[b]

  add(cell, set) {
    this.cells[cell] = set
    if (this.sets[set] === undefined || this.sets[set] === null) {
      this.sets[set] = []
    }
    this.sets[set].push(cell)
  }

  setFor = (cell) => this.cells[cell]

  foreach(fn) {
    for (let id in this.sets) {
      fn(id, this.sets[id])
    }
  }
}