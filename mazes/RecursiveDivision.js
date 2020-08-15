Maze.Algorithms.RecursiveDivision = class extends Algorithm {
  CHOOSE_REGION = 0
  MAKE_WALL = 1
  MAKE_PASSAGE = 2

  HORIZONTAL = 1
  VERTICAL = 2

  isCurrent = (x, y) => (this.region != null) && (this.region.x <= x && x < this.region.x + this.region.width) && (this.region.y <= y && y < this.region.y + this.region.height)

  constructor(maze, options) {
    super(maze)
    this.stack = [{x: 0, y: 0, width: this.maze.width, height: this.maze.height}]
    this.state = this.CHOOSE_REGION
  }

  chooseOrientation(width, height) {
    if (width < height) {
      return this.HORIZONTAL
    } else if (height < width) {
      return this.VERTICAL
    } else if (this.rand.nextBoolean()) {
      return this.HORIZONTAL
    } else {
      return this.VERTICAL
    }
  }

  updateRegion(region) {
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        this.updateAt(region.x + x, region.y + y)
      }
    }
  }

  step() {
    switch (this.state) {
      case this.CHOOSE_REGION:
        return this.chooseRegion()
      case this.MAKE_WALL:
        return this.makeWall()
      case this.MAKE_PASSAGE:
        return this.makePassage()
    }
  }

  chooseRegion() {
    let priorRegion = this.region
    this.region = this.stack.pop()
    if (priorRegion) {
      this.updateRegion(priorRegion)
    }

    if (this.region) {
      this.updateRegion(this.region)
      this.state = this.MAKE_WALL
      return true
    } else {
      return false
    }
  }

  makeWall() {
    this.horizontal = this.chooseOrientation(this.region.width, this.region.height) === this.HORIZONTAL
    
    this.wx = this.region.x + (this.horizontal ? 0 : this.rand.nextInteger(this.region.width - 2))
    this.wy = this.region.y + (this.horizontal ? this.rand.nextInteger(this.region.height - 2) : 0)
    
    let dx = this.horizontal ? 1 : 0
    let dy = this.horizontal ? 0 : 1
    
    let length = this.horizontal ? this.region.width : this.region.height
    
    this.dir = this.horizontal ? Direction.S : Direction.E
    this.odir = Direction.opposite[this.dir]
    
    let x = this.wx
    let y = this.wy
    while (length > 0) {
      this.maze.carve(x, y, this.dir)
      this.updateAt(x, y)

      let nx = x + Direction.dx[this.dir]
      let ny = y + Direction.dy[this.dir]
      this.maze.carve(nx, ny, this.odir)
      this.updateAt(nx, ny)

      x += dx
      y += dy
      length -= 1
    }

    this.state = this.MAKE_PASSAGE
    return true
  }

  makePassage() {
    let px = this.wx + (this.horizontal ? this.rand.nextInteger(this.region.width) : 0)
    let py = this.wy + (this.horizontal ? 0 : this.rand.nextInteger(this.region.height))
    
    this.maze.uncarve(px, py, this.dir)
    this.updateAt(px, py)
    
    let nx = px + Direction.dx[this.dir]
    let ny = py + Direction.dy[this.dir]
    this.maze.uncarve(nx, ny, this.odir)
    this.updateAt(nx, ny)
    
    let width = this.horizontal ? this.region.width : this.wx - this.region.x + 1
    let height = this.horizontal ? this.wy - this.region.y + 1 : this.region.height
    if (width >= 2 && height >= 2) {
      this.stack.push({x: this.region.x, y: this.region.y, width: width, height: height})
    }

    let x = this.horizontal ? this.region.x : this.wx + 1
    let y = this.horizontal ? this.wy + 1 : this.region.y
    width = this.horizontal ? this.region.width : this.region.x + this.region.width - this.wx - 1
    height = this.horizontal ? this.region.y + this.region.height - this.wy - 1 : this.region.height
    if (width >= 2 && height >= 2) {
      this.stack.push({x: x, y: y, width: width, height: height})
    }

    this.state = this.CHOOSE_REGION
    return true
  }
}