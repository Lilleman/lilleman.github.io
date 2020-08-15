Maze.Algorithms.ParallelBacktracker = class extends Algorithm {
  IN = 0x1000
  STACK = 0x2000

  START = 1
  RUN = 2
  DONE = 3

  constructor(maze, options) {
    super(maze, options)

    this.cells = []
    this.sets = {}
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        let name = "c" + x + "r" + y
        
        let north = "c" + x + "r" + (y - 1)
        let south = "c" + x + "r" + (y + 1)
        let east = "c" + (x + 1) + "r" + y
        let west = "c" + (x - 1) + "r" + y
        
        let cell = {x: x, y: y, name: name, north: north, south: south, west: west, east: east, dirs: this.rand.randomDirections()}
        
        this.cells.push(cell)
        this.cells[name] = cell
      }
    }

    this.state = this.START
    this.stacks = new Array(options.input || 2).fill(0).map(x => [])
  }

  step() {
    switch (this.state) {
      case this.START:
        this.startStep()
        break
      case this.RUN:
        this.runStep()
    }

    return this.state !== this.DONE
  }

  startStep() {
    let res = new Array(this.cells.length).fill(0).map((x, i) => i)
    let indexes = this.rand.randomizeList(res)

    for (let i = 0; i < this.stacks.length; i++) {
      let cell = this.cells[indexes[i]]
      this.maze.carve(cell.x, cell.y, this.IN | this.STACK)
      this.updateAt(cell.x, cell.y)
      cell.set = "s" + i
      this.stacks[i] = [cell]
      this.sets[cell.set] = [cell]
    }

    this.state = this.RUN
  }

  cellAt = (x, y) => this.cells["c" + x + "r" + y]

  runStep() {
    let activeStacks = 0
    
    for (let i = 0; i < this.stacks.length; i++) {
      let stack = this.stacks[i]
      if (stack.length === 0) {
        continue
      }

      activeStacks += 1
      
      while (true) {
        let current = stack[stack.length - 1]
        let dir = current.dirs.pop()
        
        let nx = current.x + Direction.dx[dir]
        let ny = current.y + Direction.dy[dir]
        
        if (this.maze.isValid(nx, ny)) {
          let neighbor = this.cellAt(nx, ny)
          if ((neighbor != null) && current.set !== neighbor.set) {
            stack.push(neighbor)
            this.maze.carve(current.x, current.y, dir)
            this.maze.carve(neighbor.x, neighbor.y, Direction.opposite[dir] | this.STACK)
            
            this.updateAt(current.x, current.y)
            
            let oldSet = neighbor.set
            if (this.sets[oldSet] == null) {
              this.sets[oldSet] = [neighbor]
            }
            for (let k = 0; k < this.sets[oldSet].length; k++) {
              let n = this.sets[oldSet][k]
              n.set = current.set
              this.sets[current.set].push(n)
              this.updateAt(n.x, n.y)
            }

            delete this.sets[oldSet]
            break
          }
        }

        if (current.dirs.length === 0) {
          this.maze.uncarve(current.x, current.y, this.STACK)
          this.updateAt(current.x, current.y)
          stack.pop()
          break
        }
      }
    }

    if (activeStacks === 0) {
      this.state = this.DONE
      for (let l = 0; l < this.cells.length; l++) {
        let cell = this.cells[l]
        cell.set = "final"
        this.updateAt(cell.x, cell.y)
      }
    }
  }

  isStack = (x, y) => this.maze.isSet(x, y, this.STACK)
}