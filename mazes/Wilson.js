Maze.Algorithms.Wilson = class extends Algorithm {
  IN = 4096

  constructor(maze, options) {
    super(maze)
    this.state = 0
    this.remaining = this.maze.width * this.maze.height
    this.visits = {}
  }

  isCurrent = (x, y) => this.x === x && this.y === y
  isVisited = (x, y) => this.visits["" + x + ":" + y] != null
  addVisit = (x, y, dir) => this.visits["" + x + ":" + y] = (dir != null ? dir : 0)
  exitTaken = (x, y) => this.visits["" + x + ":" + y]

  startStep() {
    let x = this.rand.nextInteger(this.maze.width)
    let y = this.rand.nextInteger(this.maze.height)
    this.maze.carve(x, y, this.IN)
    this.updateAt(x, y)
    this.remaining--
    this.state = 1
  }

  startWalkStep() {
    this.visits = {}

    while (true) {
      this.x = this.rand.nextInteger(this.maze.width)
      this.y = this.rand.nextInteger(this.maze.height)
      if (this.maze.isBlank(this.x, this.y)) {
        this.eventAt(this.x, this.y)
        this.state = 2
        this.start = {x: this.x, y: this.y}
        this.addVisit(this.x, this.y)
        this.updateAt(this.x, this.y)
        break
      }
    }
  }

  walkStep() {
    let dirs = this.rand.randomDirections()
    for (let i = 0; i < dirs.length; i++) {
      let direction = dirs[i]
      let nx = this.x + Direction.dx[direction]
      let ny = this.y + Direction.dy[direction]

      if (this.maze.isValid(nx, ny)) {
        let x = this.x
        let y = this.y
        this.x = nx
        this.y = ny

        if (this.isVisited(nx, ny)) {
          this.eraseLoopFrom(nx, ny)
        } else {
          this.addVisit(x, y, direction)
        }

        this.updateAt(x, y)
        this.updateAt(nx, ny)

        if (!this.maze.isBlank(nx, ny)) {
          this.x = this.start.x
          this.y = this.start.y
          this.state = 3
          this.eventAt(this.x, this.y)
        }

        break
      }
    }
  }

  resetVisits() {
    for (let key in this.visits) {
      let x = key.split(":")[0]
      let y = key.split(":")[1]
      delete this.visits[key]
      this.updateAt(x, y)
    }
  }

  runStep() {
    if (this.remaining > 0) {
      let dir = this.exitTaken(this.x, this.y)
      let nx = this.x + Direction.dx[dir]
      let ny = this.y + Direction.dy[dir]

      if (!this.maze.isBlank(nx, ny)) {
        this.resetVisits()
        this.state = 1
      }

      this.maze.carve(this.x, this.y, dir)
      this.maze.carve(nx, ny, Direction.opposite[dir])

      let x = this.x
      let y = this.y
      this.x = nx
      this.y = ny

      if (this.state === 1) {
        delete this.x
        delete this.y
      }

      this.updateAt(x, y)
      this.updateAt(nx, ny)

      this.remaining--
    }
    
    return this.remaining > 0
  }

  step() {
    if (this.remaining > 0) {
      switch (this.state) {
        case 0:
          this.startStep()
          break
        case 1:
          this.startWalkStep()
          break
        case 2:
          this.walkStep()
          break
        case 3:
          this.runStep()
      }
    }
    return this.remaining > 0
  }

  eraseLoopFrom(x, y) {
    while (true) {
      let dir = this.exitTaken(x, y)
      if (!dir) {
        break
      }

      let nx = x + Direction.dx[dir]
      let ny = y + Direction.dy[dir]

      let key = x + ":" + y
      delete this.visits[key]
      this.updateAt(x, y)

      x = nx
      y = ny
    }
  }
}