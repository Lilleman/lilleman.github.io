function createCanvasWidget(algorithm, width, height, options) {
  options = (options == null) ? {} : options

  let styles = (options.styles != null) ? options.styles : {}

  styles.blank = (styles.blank == null) ? "#ccc" : styles.blank
  styles.f = (styles.f == null) ? "#faa" : styles.f
  styles.a = (styles.a == null) ? "#faa" : styles.a
  styles.b = (styles.b == null) ? "#afa" : styles.b
  styles.in = (styles["in"] == null) ? "#fff" : styles.in
  styles.cursor = (styles.cursor == null) ? "#7f7" : styles.cursor
  styles.wall = (styles.wall == null) ? "#000" : styles.wall

  const COLORS = {
    AldousBroder: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor
      } else if (!maze.isBlank(x, y)) {
        return styles["in"]
      }
    },
    GrowingTree: function(maze, x, y) {
      if (!maze.isBlank(x, y)) {
        if (maze.algorithm.inQueue(x, y)) {
          return styles.f
        } else {
          return styles["in"]
        }
      }
    },
    GrowingBinaryTree: function(maze, x, y) {
      return COLORS.GrowingTree(maze, x, y)
    },
    HuntAndKill: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor
      } else if (!maze.isBlank(x, y)) {
        return styles["in"]
      }
    },
    Prim: function(maze, x, y) {
      if (maze.algorithm.isFrontier(x, y)) {
        return styles.f
      } else if (maze.algorithm.isInside(x, y)) {
        return styles["in"]
      }
    },
    RecursiveBacktracker: function(maze, x, y) {
      if (maze.algorithm.isStack(x, y)) {
        return styles.f
      } else if (!maze.isBlank(x, y)) {
        return styles["in"]
      }
    },
    ParallelBacktracker: function(maze, x, y) {
      let cell = maze.algorithm.cellAt(x, y)
      if (maze.algorithm.isStack(x, y)) {
        return styles.sets["stack-" + cell.set] != null ? styles.sets["stack-" + cell.set] : styles.f
      } else if (!maze.isBlank(x, y)) {
        return styles.sets[cell.set] != null ? styles.sets[cell.set] : "#fff"
      }
    },
    RecursiveDivision: function(maze, x, y) {},
    Wilson: function(maze, x, y) {
      if (maze.algorithm.isCurrent(x, y)) {
        return styles.cursor
      } else if (!maze.isBlank(x, y)) {
        return styles["in"]
      } else if (maze.algorithm.isVisited(x, y)) {
        return styles.f
      }
    },
    Houston: function(maze, x, y) {
      if (maze.algorithm.worker != null) {
        if (maze.algorithm.worker.isVisited != null) {
          return COLORS.Wilson(maze, x, y)
        } else {
          return COLORS.AldousBroder(maze, x, y)
        }
      }
    },
    BlobbyDivision: function(maze, x, y) {
      switch (maze.algorithm.stateAt(x, y)) {
        case "blank":
          return styles.blank
        case "in":
          return styles["in"]
        case "active":
          return styles.f
        case "a":
          return styles.a
        case "b":
          return styles.b
      }
    },
    "default": function(maze, x, y) {
      if (!maze.isBlank(x, y)) {
        return styles["in"]
      }
    }
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
  }

  function drawCell(maze, x, y) {
    let px = x * maze.cellWidth
    let py = y * maze.cellHeight

    let wmpx = x === 0 ? px + 0.5 : px - 0.5
    let nmpy = y === 0 ? py + 0.5 : py - 0.5
    let empx = px - 0.5
    let smpy = py - 0.5

    let colors = COLORS[algorithm] || COLORS["default"]
    let color = colors(maze, x, y)
    color = (color == null) ? (options.wallwise ? styles["in"] : styles.blank) : color

    maze.context.fillStyle = color
    maze.context.fillRect(px, py, maze.cellWidth, maze.cellHeight)

    maze.context.beginPath()
    
    if (maze.isWest(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, wmpx, py, wmpx, py + maze.cellHeight)
    }
    if (maze.isEast(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, empx + maze.cellWidth, py, empx + maze.cellWidth, py + maze.cellHeight)
    }
    if (maze.isNorth(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, px, nmpy, px + maze.cellWidth, nmpy)
    }
    if (maze.isSouth(x, y) === (options.wallwise != null)) {
      drawLine(maze.context, px, smpy + maze.cellHeight, px + maze.cellWidth, smpy + maze.cellHeight)
    }

    maze.context.closePath()
    maze.context.stroke()
  }

  function drawCellPadded(maze, x, y) {
    let px1 = x * maze.cellWidth
    let px2 = px1 + maze.insetWidth - 0.5
    let px4 = px1 + maze.cellWidth - 0.5
    let px3 = px4 - maze.insetWidth
    
    let py1 = y * maze.cellHeight
    let py2 = py1 + maze.insetHeight - 0.5
    let py4 = py1 + maze.cellHeight - 0.5
    let py3 = py4 - maze.insetHeight
    
    px1 = x === 0 ? px1 + 0.5 : px1 - 0.5
    py1 = y === 0 ? py1 + 0.5 : py1 - 0.5
    
    let colors = COLORS[algorithm] || COLORS["default"]
    let color = colors(maze, x, y)
    color = (color == null) ? (options.wallwise ? styles["in"] : styles.blank) : color

    maze.context.fillStyle = color
    maze.context.fillRect(px2 - 0.5, py2 - 0.5, px3 - px2 + 1, py3 - py2 + 1)
    
    maze.context.beginPath()
    
    if (maze.isWest(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px1 - 0.5, py2 - 0.5, px2 - px1 + 1, py3 - py2 + 1)
      drawLine(maze.context, px1 - 1, py2, px2, py2)
      drawLine(maze.context, px1 - 1, py3, px2, py3)
    }
    if (!maze.isWest(x, y)) {
      drawLine(maze.context, px2, py2, px2, py3)
    }

    if (maze.isEast(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px3 - 0.5, py2 - 0.5, px4 - px3 + 1, py3 - py2 + 1)
      drawLine(maze.context, px3, py2, px4 + 1, py2)
      drawLine(maze.context, px3, py3, px4 + 1, py3)
    }
    if (!maze.isEast(x, y)) {
      drawLine(maze.context, px3, py2, px3, py3)
    }
    
    if (maze.isNorth(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px2 - 0.5, py1 - 0.5, px3 - px2 + 1, py2 - py1 + 1)
      drawLine(maze.context, px2, py1 - 1, px2, py2)
      drawLine(maze.context, px3, py1 - 1, px3, py2)
    }
    if (!maze.isNorth(x, y)) {
      drawLine(maze.context, px2, py2, px3, py2)
    }
    
    if (maze.isSouth(x, y) || maze.isUnder(x, y)) {
      maze.context.fillRect(px2 - 0.5, py3 - 0.5, px3 - px2 + 1, py4 - py3 + 1)
      drawLine(maze.context, px2, py3, px2, py4 + 1)
      drawLine(maze.context, px3, py3, px3, py4 + 1)
    }
    if (!maze.isSouth(x, y)) {
      drawLine(maze.context, px2, py3, px3, py3)
    }

    maze.context.closePath()
    maze.context.stroke()
  }

  function drawMaze(maze) {
    for (let row = 0; row < maze.height; row++) {
      for (let col = 0; col < maze.width; col++) {
        if (options.padded) {
          drawCellPadded(maze, col, row)
        } else {
          drawCell(maze, col, row)
        }
      }
    }
  }

  function updateCallback(maze, x, y) {
    if (options.padded) {
      drawCellPadded(maze, x, y)
    } else {
      drawCell(maze, x, y)
    }
  }

  function eventCallback(maze, x, y) {
    if (maze.element.quickStep) {
      return maze.element.mazePause()
    }
  }

  let id = options.id || algorithm.toLowerCase()
  options.interval = (options.interval == null) ? 50 : options.interval

  let mazeClass = "maze"
  mazeClass += (options["class"]) ? " " + options["class"] : ""

  let gridClass = "grid"
  gridClass += (options.wallwise) ? " invert" : ""
  gridClass += (options.padded) ? " padded" : ""

  let watch = ""
  if (options.watch != null ? options.watch : true) {
    watch = "<a id='" + id + "_watch' href='#' onclick='document.getElementById(\"" + id + "\").mazeQuickStep(); return false;'>Watch</a>"
  }

  let html = "<div id=\"" + id + "\" class=\"" + mazeClass + "\">\n  <canvas id=\"" + id + "_canvas\" width=\"210\" height=\"210\" class=\"" + gridClass + "\"></canvas>\n  <div class=\"operations\">\n    <a id=\"" + id + "_reset\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeReset(); return false;\">Reset</a>\n    <a id=\"" + id + "_step\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeStep(); return false;\">Step</a>\n    " + watch + "\n    <a id=\"" + id + "_run\" href=\"#\" onclick=\"document.getElementById('" + id + "').mazeRun(); return false;\">Run</a>\n  </div>\n</div>"
  
  document.write(html)
  let element = document.getElementById(id)
  
  element.addClassName = function(el, name) {
    let classNames = el.className.split(" ")
    for (let i = 0; i < classNames.length; i++) {
      if (classNames[i] === name) {
        return
      }
    }
    return el.className += " " + name
  }

  element.removeClassName = function(el, name) {
    if (el.className.length > 0) {
      let classNames = el.className.split(" ")
      el.className = ""
      for (let i = 0; i < classNames.length; i++) {
        if (classNames[i] !== name) {
          if (el.className.length > 0) {
            el.className += " "
          }
          el.className += classNames[i]
        }
      }
    }
  }

  element.mazePause = function() {
    if (this.mazeStepInterval != null) {
      clearInterval(this.mazeStepInterval)
      this.mazeStepInterval = null
      this.quickStep = false
      return true
    }
  }

  element.mazeRun = function() {
    if (!this.mazePause()) {
      this.mazeStepInterval = setInterval(() => this.mazeStep(), options.interval)
    }
  }

  element.mazeStep = function() {
    if (!this.maze.step()) {
      this.mazePause()
      this.addClassName(document.getElementById(this.id + "_step"), "disabled")
      if (options.watch != null ? options.watch : true) {
        this.addClassName(document.getElementById(this.id + "_watch"), "disabled")
      }
      this.addClassName(document.getElementById(this.id + "_run"), "disabled")
    }
  }

  element.mazeQuickStep = function() {
    this.quickStep = true
    this.mazeRun()
  }

  element.mazeReset = function() {
    this.mazePause()

    let value = (typeof options.input === "function") ? options.input(): options.input

    let threshold = (typeof options.threshold === "function") ? options.threshold() : options.threshold

    let growSpeed = Math.round(Math.sqrt(width * height))
    let wallSpeed = Math.round((width < height ? width : height) / 2)
    
    this.maze = new Maze(width, height, Maze.Algorithms[algorithm], {
      seed: options.seed, rng: options.rng, input: value, weave: options.weave,
      weaveMode: options.weaveMode, weaveDensity: options.weaveDensity,
      threshold: threshold, growSpeed: growSpeed, wallSpeed: wallSpeed
    })

    let canvas = document.getElementById(this.id + "_canvas")

    this.maze.element = this
    this.maze.canvas = canvas
    this.maze.context = canvas.getContext('2d')
    this.maze.cellWidth = Math.floor(canvas.width / this.maze.width)
    this.maze.cellHeight = Math.floor(canvas.height / this.maze.height)

    if (options.padded) {
      let inset = options.inset != null ? options.inset : 0.1
      this.maze.insetWidth = Math.ceil(inset * this.maze.cellWidth)
      this.maze.insetHeight = Math.ceil(inset * this.maze.cellHeight)
    }

    this.maze.onUpdate(updateCallback)
    this.maze.onEvent(eventCallback)
    
    this.maze.context.clearRect(0, 0, canvas.width, canvas.height)
    
    this.removeClassName(document.getElementById(this.id + "_step"), "disabled")
    if (options.watch != null ? options.watch : true) {
      this.removeClassName(document.getElementById(this.id + "_watch"), "disabled")
    }
    this.removeClassName(document.getElementById(this.id + "_run"), "disabled")
    drawMaze(this.maze)
  }

  element.mazeReset()
}