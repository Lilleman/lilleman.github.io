Maze.Algorithms.GrowingBinaryTree = class extends Maze.Algorithms.GrowingTree {
  runStep() {
    let index = this.nextCell()

    let cell = this.cells.splice(index, 1)[0]
    this.maze.uncarve(cell.x, cell.y, this.QUEUE)
    this.updateAt(cell.x, cell.y)

    let count = 0
    let dirs = this.rand.randomDirections()
    for (let i = 0; i < dirs.length; i++) {
      let direction = dirs[i]
      let nx = cell.x + Direction.dx[direction]
      let ny = cell.y + Direction.dy[direction]

      if (this.maze.isValid(nx, ny) && this.maze.isBlank(nx, ny)) {
        this.maze.carve(cell.x, cell.y, direction)
        this.maze.carve(nx, ny, Direction.opposite[direction])
        this.enqueue(nx, ny)
        this.updateAt(cell.x, cell.y)
        this.updateAt(nx, ny)
        count += 1
        if (count > 1) {
          return
        }
      }
    }
  }
}
