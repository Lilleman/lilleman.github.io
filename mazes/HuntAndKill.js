Maze.Algorithms.HuntAndKill = class extends Algorithm {
  IN = 4096

  constructor(maze) {
    super(maze)
    this.state = 0
  }

  isCurrent(x, y) {
    return (this.x || x) === x && this.y === y
  }

  isWalking() {
    return this.state === 1
  }

  isHunting() {
    return this.state === 2
  }

  callbackRow(y) {
    for (let x = 0; x < this.maze.width; x++) {
      this.updateAt(x, y)
    }
  }

  startStep() {
    this.x = this.rand.nextInteger(this.maze.width)
    this.y = this.rand.nextInteger(this.maze.height)
    this.maze.carve(this.x, this.y, this.IN)
    this.updateAt(this.x, this.y)
    return this.state = 1
  }

  walkStep() {
    let self = this
    let dirs = this.rand.randomDirections()
    for (let i = 0; i < dirs.length; i++) {
      let direction = dirs[i]
      let nx = this.x + Direction.dx[direction]
      let ny = this.y + Direction.dy[direction]

      if (this.maze.isValid(nx, ny)) {
        if (this.maze.isBlank(nx, ny)) {
          let x = this.x
          let y = this.y
          this.x = nx
          this.y = ny
          this.maze.carve(x, y, direction)
          this.maze.carve(nx, ny, Direction.opposite[direction])
          this.updateAt(x, y)
          this.updateAt(nx, ny)
          return
        } else {
          if (this.canWeave(direction, nx, ny)) {
            this.performWeave(direction, this.x, this.y, (x, y) => {
              x = self.x
              y = self.y
              self.x = x
              self.y = y
            })
            return
          }
        }
      }
    }

    let x = this.x
    let y = this.y
    delete this.x
    delete this.y
    this.updateAt(x, y)
    this.eventAt(x, y)
    this.y = 0
    this.state = 2
    return this.callbackRow(0)
  }

  huntStep() {
    for (let x = 0; x < this.maze.width; x++) {
      if (this.maze.isBlank(x, this.y)) {
        let neighbors = []
        if (this.y > 0 && !this.maze.isBlank(x, this.y - 1)) {
          neighbors.push(Direction.N)
        }
        if (x > 0 && !this.maze.isBlank(x - 1, this.y)) {
          neighbors.push(Direction.W)
        }
        if (this.y + 1 < this.maze.height && !this.maze.isBlank(x, this.y + 1)) {
          neighbors.push(Direction.S)
        }
        if (x + 1 < this.maze.width && !this.maze.isBlank(x + 1, this.y)) {
          neighbors.push(Direction.E)
        }

        let direction = this.rand.randomElement(neighbors)
        if (direction) {
          this.x = x

          let nx = this.x + Direction.dx[direction]
          let ny = this.y + Direction.dy[direction]

          this.maze.carve(this.x, this.y, direction)
          this.maze.carve(nx, ny, Direction.opposite[direction])

          this.state = 1

          this.updateAt(nx, ny)

          this.callbackRow(this.y)
          this.eventAt(nx, ny)
          return
        }
      }
    }

    this.y++
    this.callbackRow(this.y - 1)
    if (this.y >= this.maze.height) {
      this.state = 3
      delete this.x
      return delete this.y
    } else {
      return this.callbackRow(this.y)
    }
  }

  step() {
    switch (this.state) {
      case 0:
        this.startStep()
        break
      case 1:
        this.walkStep()
        break
      case 2:
        this.huntStep()
    }
    return this.state !== 3
  }
}