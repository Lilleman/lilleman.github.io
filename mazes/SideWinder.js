Maze.Algorithms.Sidewinder = class extends Algorithm {
  IN = 4096

  isCurrent = (x, y) => this.x === x && this.y === y

  constructor(maze) {
    super(maze)
    this.x = 0
    this.y = 0
    this.runStart = 0
    this.state = 0
  }

  step() {
    if (this.y >= this.maze.height) {
      return false
    }

    if (this.y > 0 && (this.x + 1 >= this.maze.width || this.rand.nextBoolean())) {
      let cell = this.runStart + this.rand.nextInteger(this.x - this.runStart + 1)
      this.maze.carve(cell, this.y, Direction.N)
      this.maze.carve(cell, this.y - 1, Direction.S)
      this.updateAt(cell, this.y)
      this.updateAt(cell, this.y - 1)
      if (this.x - this.runStart > 0) {
        this.eventAt(this.x, this.y)
      }
      this.runStart = this.x + 1
    } else {
      if (this.x + 1 < this.maze.width) {
        this.maze.carve(this.x, this.y, Direction.E)
        this.maze.carve(this.x + 1, this.y, Direction.W)
        this.updateAt(this.x, this.y)
        this.updateAt(this.x + 1, this.y)
      } else {
        this.maze.carve(this.x, this.y, this.IN)
        this.updateAt(this.x, this.y)
      }
    }

    let oldX = this.x
    let oldY = this.y

    this.x++
    if (this.x >= this.maze.width) {
      this.x = 0
      this.runStart = 0
      this.y++
    }

    this.updateAt(oldX, oldY)
    this.updateAt(this.x, this.y)
    return this.y < this.maze.height
  }
}