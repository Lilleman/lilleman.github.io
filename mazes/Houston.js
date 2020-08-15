Maze.Algorithms.Houston = class extends Algorithm {
  constructor(maze, options) {
    super(maze)
    this.options = options
    this.threshold = 2 * this.maze.width * this.maze.height / 3
  }

  isCurrent = (x, y) => this.worker.isCurrent(x, y)
  isVisited = (x, y) => this.worker.isVisited(x, y)

  step() {
    if (!this.worker) {
      this.worker = new Maze.Algorithms.AldousBroder(this.maze, this.options)
      this.worker.onUpdate(this.updateCallback)
      this.worker.onEvent(this.eventCallback)
    }

    if (this.worker.remaining < this.threshold) {
      let x = this.worker.x
      let y = this.worker.y
      delete this.worker.x
      delete this.worker.y
      this.updateAt(x, y)
      this.eventAt(x, y)

      let wilsons = new Maze.Algorithms.Wilson(this.maze, this.options)
      wilsons.onUpdate(this.updateCallback)
      wilsons.onEvent(this.eventCallback)
      wilsons.state = 1
      wilsons.remaining = this.worker.remaining

      this.worker = wilsons
      this.step = () => this.worker.step()
    }
    return this.worker.step()
  }
}