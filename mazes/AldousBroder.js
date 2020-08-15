Maze.Algorithms.AldousBroder = class extends Algorithm {
  IN = 4096

  constructor(maze, options) {
    super(maze)
    this.state = 0
    this.remaining = this.maze.width * this.maze.height
  }

  isCurrent = (x, y) => this.x === x && this.y === y

  startStep() {
    this.x = this.rand.nextInteger(this.maze.width)
    this.y = this.rand.nextInteger(this.maze.height)
    this.maze.carve(this.x, this.y, this.IN)
    this.updateAt(this.x, this.y)
    this.remaining--
    this.state = 1
    this.carvedOnLastStep = true
  }

  runStep() {
    let carved = false
    if (this.remaining > 0) {
      let dirs = this.rand.randomDirections()
      for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i]
        let nx = this.x + Direction.dx[dir]
        let ny = this.y + Direction.dy[dir]

        if (this.maze.isValid(nx, ny)) {
          let x = this.x
          let y = this.y
          this.x = nx
          this.y = ny

          if (this.maze.isBlank(nx, ny)) {
            this.maze.carve(x, y, dir)
            this.maze.carve(this.x, this.y, Direction.opposite[dir])
            this.remaining--
            carved = true

            if (this.remaining === 0) {
              delete this.x
              delete this.y
            }
          }

          this.updateAt(x, y)
          this.updateAt(nx, ny)

          break
        }
      }
    }

    if (carved !== this.carvedOnLastStep) {
      this.eventAt(this.x, this.y)
    }
    this.carvedOnLastStep = carved

    return this.remaining > 0
  }

  step() {
    switch (this.state) {
      case 0:
        this.startStep()
        break
      case 1:
        this.runStep()
    }
    return this.remaining > 0
  }
}