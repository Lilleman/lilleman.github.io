Maze.Algorithms.Kruskal = class extends Algorithm {
  WEAVE = 1
  JOIN = 2

  constructor(maze, options) {
    super(maze)

    this.sets = []
    this.edges = []

    for (let y = 0; y < maze.height; y++) {
      this.sets.push([])
      for (let x = 0; x < maze.width; x++) {
        this.sets[y].push(new Maze.Algorithms.Kruskal.Tree())
        if (y > 0) {
          this.edges.push({x: x, y: y, direction: Direction.N})
        }
        if (x > 0) {
          this.edges.push({x: x, y: y, direction: Direction.W})
        }
      }
    }

    this.rand.randomizeList(this.edges)

    this.weaveMode = options.weaveMode || "onePhase"
    if (typeof this.weaveMode === "function") {
      this.weaveMode = this.weaveMode()
    }

    this.weaveDensity = options.weaveDensity || 80
    if (typeof this.weaveDensity === "function") {
      this.weaveDensity = this.weaveDensity()
    }

    this.state = (this.maze.isWeave && this.weaveMode === "twoPhase") ? this.WEAVE : this.JOIN
  }

  connect(x1, y1, x2, y2, direction) {
    this.sets[y1][x1].connect(this.sets[y2][x2])
    this.maze.carve(x1, y1, direction)
    this.updateAt(x1, y1)
    this.maze.carve(x2, y2, Direction.opposite[direction])
    this.updateAt(x2, y2)
  }

  weaveStep() {
    if (this.x == null) {
      this.y = 1
      this.x = 1
    }

    while (this.state === this.WEAVE) {
      if (this.maze.isBlank(this.x, this.y) && this.rand.nextInteger(100) < this.weaveDensity) {
        let nx = this.x
        let ny = this.y - 1
        let wx = this.x - 1
        let wy = this.y
        let ex = this.x + 1
        let ey = this.y
        let sx = this.x
        let sy = this.y + 1

        let safe = !this.sets[ny][nx].isConnectedTo(this.sets[sy][sx]) &&
          !this.sets[wy][wx].isConnectedTo(this.sets[ey][ex])
        
        if (safe) {
          this.sets[ny][nx].connect(this.sets[sy][sx])
          this.sets[wy][wx].connect(this.sets[ey][ex])

          if (this.rand.nextBoolean()) {
            this.maze.carve(this.x, this.y, Direction.E | Direction.W | Direction.U)
          } else {
            this.maze.carve(this.x, this.y, Direction.N | Direction.S | Direction.U)
          }
          
          this.maze.carve(nx, ny, Direction.S)
          this.maze.carve(wx, wy, Direction.E)
          this.maze.carve(ex, ey, Direction.W)
          this.maze.carve(sx, sy, Direction.N)

          this.updateAt(this.x, this.y)
          this.updateAt(nx, ny)
          this.updateAt(wx, wy)
          this.updateAt(ex, ey)
          this.updateAt(sx, sy)

          let newEdges = []
          for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i]
            if ((edge.x === this.x && edge.y === this.y) ||
                (edge.x === ex && edge.y === ey && edge.direction === Direction.W) ||
                (edge.x === sx && edge.y === sy && edge.direction === Direction.N)) {
              continue
            }
            newEdges.push(edge)
          }
          this.edges = newEdges

          break
        }
      }

      this.x++
      if (this.x >= this.maze.width - 1) {
        this.x = 1
        this.y++
        
        if (this.y >= this.maze.height - 1) {
          this.state = this.JOIN
          this.eventAt(this.x, this.y)
        }
      }
    }
  }

  joinStep() {
    while (this.edges.length > 0) {
      let edge = this.edges.pop()

      let nx = edge.x + Direction.dx[edge.direction]
      let ny = edge.y + Direction.dy[edge.direction]
      
      let set1 = this.sets[edge.y][edge.x]
      let set2 = this.sets[ny][nx]

      if (this.maze.isWeave && this.weaveMode === "onePhase" && this.maze.isPerpendicular(nx, ny, edge.direction)) {
        let nx2 = nx + Direction.dx[edge.direction]
        let ny2 = ny + Direction.dy[edge.direction]
        let set3 = null

        for (let index = 0; index < this.edges.length; index++) {
          let edge2 = this.edges[index]
          if (edge2.x === nx && edge2.y === ny && edge2.direction === edge.direction) {
            this.edges.splice(index, 1)
            set3 = this.sets[ny2][nx2]
            break
          }
        }
        if (set3 && !set1.isConnectedTo(set3)) {
          this.connect(edge.x, edge.y, nx2, ny2, edge.direction)
          this.performThruWeave(nx, ny)
          this.updateAt(nx, ny)
          break
        } else {
          if (!set1.isConnectedTo(set2)) {
            this.connect(edge.x, edge.y, nx, ny, edge.direction)
            break
          }
        }
      } else {
        if (!set1.isConnectedTo(set2)) {
          this.connect(edge.x, edge.y, nx, ny, edge.direction)
          break
        }
      }
    }
  }

  step() {
    if (this.state === this.WEAVE) {
      this.weaveStep()
    } else if (this.state === this.JOIN) {
      this.joinStep()
    }
    return this.edges.length > 0
  }
}

Maze.Algorithms.Kruskal.Tree = class {
  constructor() {
    this.up = null
  }

  root = () => (this.up) ? this.up.root() : this
  isConnectedTo = (tree) => this.root() === tree.root()
  connect = (tree) => tree.root().up = this
}