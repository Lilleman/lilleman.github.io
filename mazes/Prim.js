Maze.Algorithms.Prim = class extends Algorithm {
  IN = 0x1000
  FRONTIER = 0x2000

  START = 1
  EXPAND = 2
  DONE = 3

  constructor(maze) {
    super(maze)
    this.frontierCells = []
    this.state = this.START
  }

  isOutside = (x, y) => this.maze.isValid(x, y) && this.maze.isBlank(x, y)
  isInside = (x, y) => this.maze.isValid(x, y) && this.maze.isSet(x, y, this.IN)
  isFrontier = (x, y) => this.maze.isValid(x, y) && this.maze.isSet(x, y, this.FRONTIER)

  addFrontier(x, y) {
    if (this.isOutside(x, y)) {
      this.frontierCells.push({ x: x, y: y })
      this.maze.carve(x, y, this.FRONTIER)
      this.updateAt(x, y)
    }
  }

  markCell(x, y) {
    this.maze.carve(x, y, this.IN)
    this.maze.uncarve(x, y, this.FRONTIER)
    this.updateAt(x, y)
    this.addFrontier(x - 1, y)
    this.addFrontier(x + 1, y)
    this.addFrontier(x, y - 1)
    this.addFrontier(x, y + 1)
  }

  findNeighborsOf(x, y) {
    let neighbors = []
    if (this.isInside(x - 1, y)) {
      neighbors.push(Direction.W)
    }
    if (this.isInside(x + 1, y)) {
      neighbors.push(Direction.E)
    }
    if (this.isInside(x, y - 1)) {
      neighbors.push(Direction.N)
    }
    if (this.isInside(x, y + 1)) {
      neighbors.push(Direction.S)
    }
    return neighbors
  }

  startStep() {
    this.markCell(this.rand.nextInteger(this.maze.width), this.rand.nextInteger(this.maze.height))
    this.state = this.EXPAND
  }

  expandStep() {
    let cell = this.rand.removeRandomElement(this.frontierCells)
    let direction = this.rand.randomElement(this.findNeighborsOf(cell.x, cell.y))
    let nx = cell.x + Direction.dx[direction]
    let ny = cell.y + Direction.dy[direction]

    if (this.maze.isWeave && this.maze.isPerpendicular(nx, ny, direction)) {
      let nx2 = nx + Direction.dx[direction]
      let ny2 = ny + Direction.dy[direction]
      if (this.isInside(nx2, ny2)) {
        this.performThruWeave(nx, ny)
        this.updateAt(nx, ny)
        nx = nx2
        ny = ny2
      }
    }

    this.maze.carve(nx, ny, Direction.opposite[direction])
    this.updateAt(nx, ny)

    this.maze.carve(cell.x, cell.y, direction)
    this.markCell(cell.x, cell.y)

    if (this.frontierCells.length === 0) {
      this.state = this.DONE
    }
  }

  step() {
    switch (this.state) {
      case this.START:
        this.startStep()
        break
      case this.EXPAND:
        this.expandStep()
    }
    return this.state !== this.DONE
  }
}