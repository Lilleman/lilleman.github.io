class Algorithm {
  constructor(maze, options) {
    this.maze = maze
    options = (options == null) ? {} : options
    this.updateCallback = (maze, x, y) => {}
    this.eventCallback = (maze, x, y) => {}
    this.rand = this.maze.rand
  }

  onUpdate = (fn) => this.updateCallback = fn
  onEvent = (fn) => this.eventCallback = fn
  
  updateAt = (x, y) => this.updateCallback(this.maze, parseInt(x), parseInt(y))
  eventAt = (x, y) => this.eventCallback(this.maze, parseInt(x), parseInt(y))

  canWeave(dir, thruX, thruY) {
    if (this.maze.isWeave && this.maze.isPerpendicular(thruX, thruY, dir)) {
      let nx = thruX + Direction.dx[dir]
      let ny = thruY + Direction.dy[dir]
      return this.maze.isValid(nx, ny) && this.maze.isBlank(nx, ny)
    }
  }

  performThruWeave(thruX, thruY) {
    if (this.rand.nextBoolean()) {
      this.maze.carve(thruX, thruY, Direction.U)
    } else if (this.maze.isNorth(thruX, thruY)) {
      this.maze.uncarve(thruX, thruY, Direction.N | Direction.S)
      this.maze.carve(thruX, thruY, Direction.E | Direction.W | Direction.U)
    } else {
      this.maze.uncarve(thruX, thruY, Direction.E | Direction.W)
      this.maze.carve(thruX, thruY, Direction.N | Direction.S | Direction.U)
    }
  }

  performWeave(dir, fromX, fromY, callback) {
    let thruX = fromX + Direction.dx[dir]
    let thruY = fromY + Direction.dy[dir]
    let toX = thruX + Direction.dx[dir]
    let toY = thruY + Direction.dy[dir]
    
    this.maze.carve(fromX, fromY, dir)
    this.maze.carve(toX, toY, Direction.opposite[dir])
    
    this.performThruWeave(thruX, thruY)
    
    if (callback) {
      callback(toX, toY)
    }
    
    this.updateAt(fromX, fromY)
    this.updateAt(thruX, thruY)
    this.updateAt(toX, toY)
  }
}