Maze.Algorithms.RecursiveBacktracker = class extends Algorithm {
  IN = 0x1000
  STACK = 0x2000

  START = 1
  RUN = 2
  DONE = 3

  constructor(maze) {
    super(maze)
    this.state = this.START
    this.stack = []
  }

  step() {
    if (this.state === this.START) {
      this.startStep()
    } else if (this.state === this.RUN) {
      this.runStep()
    }
    return this.state !== this.DONE
  }

  startStep() {
    let x = this.rand.nextInteger(this.maze.width)
    let y = this.rand.nextInteger(this.maze.height)
    this.maze.carve(x, y, this.IN | this.STACK)
    this.updateAt(x, y)
    this.stack.push({x: x, y: y, dirs: this.rand.randomDirections()})
    this.state = this.RUN
    this.carvedOnLastStep = true
  }

  runStep() {
    while (true) {
      let current = this.stack[this.stack.length - 1]
      let dir = current.dirs.pop()

      let nx = current.x + Direction.dx[dir]
      let ny = current.y + Direction.dy[dir]

      if (this.maze.isValid(nx, ny)) {
        if (this.maze.isBlank(nx, ny)) {
          this.stack.push({x: nx, y: ny, dirs: this.rand.randomDirections()})
          this.maze.carve(current.x, current.y, dir)
          this.updateAt(current.x, current.y)

          this.maze.carve(nx, ny, Direction.opposite[dir] | this.STACK)
          this.updateAt(nx, ny)
          if (!this.carvedOnLastStep) {
            this.eventAt(nx, ny)
          }
          this.carvedOnLastStep = true
          break
        } else  if (this.canWeave(dir, nx, ny)) {
          let self = this
          this.performWeave(dir, current.x, current.y, (x, y) => {
            self.stack.push({x: x, y: y, dirs: self.rand.randomDirections()})
            if (!self.carvedOnLastStep) {
              self.eventAt(x, y)
            }
            self.maze.carve(x, y, self.STACK)
          })
          this.carvedOnLastStep = true
          break
        }
      }

      if (current.dirs.length === 0) {
        this.maze.uncarve(current.x, current.y, this.STACK)
        this.updateAt(current.x, current.y)
        if (this.carvedOnLastStep) {
          this.eventAt(current.x, current.y)
        }
        this.stack.pop()
        this.carvedOnLastStep = false
        break
      }
    }
    
    this.state = (this.stack.length === 0) ? this.DONE : this.state
  }

  isStack = (x, y) => this.maze.isSet(x, y, this.STACK)
}