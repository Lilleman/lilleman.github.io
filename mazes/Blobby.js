let BlobbyCell = class {
  constructor(row, col) {
    this.row = row
    this.col = col
    this.name = "r" + this.row + "c" + this.col
  }

  north = () => "r" + (this.row - 1) + "c" + this.col
  south = () => "r" + (this.row + 1) + "c" + this.col
  east = () => "r" + this.row + "c" + (this.col + 1)
  west = () => "r" + this.row + "c" + (this.col - 1)
}

class BlobbyRegion {
  constructor() {
    this.cells = []
  }

  addCell(cell) {
    this[cell.name] = cell
    this.cells.push(cell)
  }
}

Maze.Algorithms.BlobbyDivision = class extends Algorithm {
  START = 1
  PLANT = 2
  GROW = 3
  WALL = 4

  constructor(maze, options) {
    super(maze, options)

    this.threshold = options.threshold || 4
    this.growSpeed = options.growSpeed || 5
    this.wallSpeed = options.wallSpeed || 2

    this.stack = []
    
    let region = new BlobbyRegion()
    for (let row = 0; row < maze.height; row++) {
      for (let col = 0; col < maze.width; col++) {
        let cell = new BlobbyCell(row, col)
        region.addCell(cell)

        if (row > 0) {
          maze.carve(col, row, Direction.N)
          maze.carve(col, row - 1, Direction.S)
        }
        
        if (col > 0) {
          maze.carve(col, row, Direction.W)
          maze.carve(col - 1, row, Direction.E)
        }
      }
    }

    this.stack.push(region)
    this.state = this.START
  }

  stateAt(col, row) {
    let name = "r" + row + "c" + col
    let cell = this.region != null ? this.region[name] : null
    if (cell) {
      return cell.state || "active"
    } else {
      return "blank"
    }
  }

  step() {
    switch (this.state) {
      case this.START:
        return this.startRegion()
      case this.PLANT:
        return this.plantSeeds()
      case this.GROW:
        return this.growSeeds()
      case this.WALL:
        return this.drawWall()
    }
  }

  startRegion() {
    delete this.boundary
    this.region = this.stack.pop()

    if (this.region) {
      for (let i = 0; i < this.region.cells.length; i++) {
        let cell = this.region.cells[i]
        delete cell.state
      }
      this.highlightRegion(this.region)
      this.state = this.PLANT
      return true
    } else {
      return false
    }
  }

  plantSeeds() {
    let res = new Array(this.region.cells.length).fill(0).map((x, i) => i)
    let indexes = this.rand.randomizeList(res)
    this.subregions = {a: new BlobbyRegion(), b: new BlobbyRegion()}
    
    let a = this.region.cells[indexes[0]]
    let b = this.region.cells[indexes[1]]

    a.state = "a"
    b.state = "b"

    this.subregions.a.addCell(a)
    this.subregions.b.addCell(b)

    this.updateAt(a.col, a.row)
    this.updateAt(b.col, b.row)

    this.frontier = [a, b]
    
    this.state = this.GROW
    
    return true
  }

  growSeeds() {
    let growCount = 0
    while (this.frontier.length > 0 && growCount < this.growSpeed) {
      let index = this.rand.nextInteger(this.frontier.length)
      let cell = this.frontier[index]

      let n = this.region[cell.north()]
      let s = this.region[cell.south()]
      let e = this.region[cell.east()]
      let w = this.region[cell.west()]

      let list = []
      if (n && !n.state) {
        list.push(n)
      }
      if (s && !s.state) {
        list.push(s)
      }
      if (e && !e.state) {
        list.push(e)
      }
      if (w && !w.state) {
        list.push(w)
      }

      if (list.length > 0) {
        let neighbor = this.rand.randomElement(list)
        neighbor.state = cell.state
        this.subregions[cell.state].addCell(neighbor)
        this.frontier.push(neighbor)
        this.updateAt(neighbor.col, neighbor.row)
        growCount += 1
      } else {
        this.frontier.splice(index, 1)
      }
    }

    this.state = this.frontier.length === 0 ? this.WALL : this.GROW
    return true
  }

  findWall() {
    this.boundary = []

    for (let i = 0; i < this.subregions.a.cells.length; i++) {
      let cell = this.subregions.a.cells[i]
      let n = this.region[cell.north()]
      let s = this.region[cell.south()]
      let e = this.region[cell.east()]
      let w = this.region[cell.west()]
      
      if (n && n.state !== cell.state) {
        this.boundary.push({from: cell, to: n, dir: Direction.N})
      }
      if (s && s.state !== cell.state) {
        this.boundary.push({from: cell, to: s, dir: Direction.S})
      }
      if (e && e.state !== cell.state) {
        this.boundary.push({from: cell, to: e, dir: Direction.E})
      }
      if (w && w.state !== cell.state) {
        this.boundary.push({from: cell, to: w, dir: Direction.W})
      }
    }

    return this.rand.removeRandomElement(this.boundary)
  }

  drawWall() {
    if (!this.boundary) {
      this.findWall()
    }

    let wallCount = 0
    while (this.boundary.length > 0 && wallCount < this.wallSpeed) {
      let wall = this.rand.removeRandomElement(this.boundary)
      
      this.maze.uncarve(wall.from.col, wall.from.row, wall.dir)
      this.maze.uncarve(wall.to.col, wall.to.row, Direction.opposite[wall.dir])
      this.updateAt(wall.from.col, wall.from.row)
      wallCount += 1
    }

    if (this.boundary.length === 0) {
      for (let i = 0; i < this.region.cells.length; i++) {
        this.region.cells[i].state = "blank"
      }

      if (this.subregions.a.cells.length >= this.threshold || (this.subregions.a.cells.length > 4 && this.rand.nextInteger() % 10 < 5)) {
        this.stack.push(this.subregions.a)
      } else {
        for (let j = 0; j < this.subregions.a.cells.length; j++) {
          this.subregions.a.cells[j].state = "in"
        }
      }
      
      if (this.subregions.b.cells.length >= this.threshold || (this.subregions.b.cells.length > 4 && this.rand.nextInteger() % 10 < 5)) {
        this.stack.push(this.subregions.b)
      } else {
        for (let k = 0; k < this.subregions.b.cells.length; k++) {
          this.subregions.b.cells[k].state = "in"
        }
      }
      
      this.highlightRegion(this.subregions.a)
      this.highlightRegion(this.subregions.b)
      
      this.state = this.START
    }

    return true
  }

  highlightRegion(region) {
    for (let i = 0; i < region.cells.length; i++) {
      this.updateAt(region.cells[i].col, region.cells[i].row)
    }
  }
}