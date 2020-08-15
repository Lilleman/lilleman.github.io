Maze.Algorithms.BinaryTree = class extends Algorithm {
  IN = 0x1000

  isCurrent = (x, y) => this.x === x && this.y === y

  constructor(maze, options) {
    super(maze)
    this.x = 0
    this.y = 0

    switch (options.input != null ? options.input : "nw") {
      case "nw":
        this.bias = Direction.N | Direction.W
        break
      case "ne":
        this.bias = Direction.N | Direction.E
        break
      case "sw":
        this.bias = Direction.S | Direction.W
        break
      case "se":
        this.bias = Direction.S | Direction.E
    }

    this.northBias = (this.bias & Direction.N) !== 0
    this.southBias = (this.bias & Direction.S) !== 0
    this.eastBias = (this.bias & Direction.E) !== 0
    this.westBias = (this.bias & Direction.W) !== 0
  }

  step() {
    if (this.y >= this.maze.height) {
      return false
    }

    let dirs = []
    if (this.northBias && this.y > 0) {
      dirs.push(Direction.N)
    }
    if (this.southBias && this.y + 1 < this.maze.height) {
      dirs.push(Direction.S)
    }
    if (this.westBias && this.x > 0) {
      dirs.push(Direction.W)
    }
    if (this.eastBias && this.x + 1 < this.maze.width) {
      dirs.push(Direction.E)
    }

    let direction = this.rand.randomElement(dirs)
    if (direction) {
      let nx = this.x + Direction.dx[direction]
      let ny = this.y + Direction.dy[direction]

      this.maze.carve(this.x, this.y, direction)
      this.maze.carve(nx, ny, Direction.opposite[direction])

      this.updateAt(nx, ny)
    } else {
      this.maze.carve(this.x, this.y, this.IN)
    }

    let oldX = this.x
    let oldY = this.y

    this.x++
    if (this.x >= this.maze.width) {
      this.x = 0
      this.y++
      this.eventAt(this.x, this.y)
    }

    this.updateAt(oldX, oldY)
    this.updateAt(this.x, this.y)
    
    return this.y < this.maze.height
  }
}