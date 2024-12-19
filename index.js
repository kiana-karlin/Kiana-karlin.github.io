const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight




class Player {
  constructor({ position, velocity }) {
    this.position = position // {x, y}
    this.velocity = velocity
    this.rotation = 0
  }

  draw() {
    c.save()

    c.translate(this.position.x, this.position.y)
    c.rotate(this.rotation)
    c.translate(-this.position.x, -this.position.y)

    c.beginPath()
    c.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2, false)
    c.fillStyle = 'khaki'
    c.fill()
    c.closePath()

    // c.fillStyle = 'orange'
    // c.fillRect(this.position.x, this.position.y, 100, 100)
    c.beginPath()
    c.moveTo(this.position.x + 40, this.position.y)
    c.lineTo(this.position.x - 20, this.position.y - 20)
    c.lineTo(this.position.x - 20, this.position.y + 20)
    c.closePath()

    c.strokeStyle = 'black'
    c.stroke()
    c.restore()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }

  getVertices() {
    const cos = Math.cos(this.rotation)
    const sin = Math.sin(this.rotation)

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ]
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 5
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
    c.closePath()
    c.fillStyle = 'lavender'
    c.fill()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position
    this.velocity = velocity
    this.radius = radius
  }

  draw() {
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
    c.closePath()
    c.strokeStyle = 'darkred'
    c.stroke()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
})

const player2 = new Player({
  position: {x: canvas.width / 3, y: canvas.height / 3},
  velocity: {x: 0, y : 0 }
})

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },

  ArrowUP: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  }
}



const SPEED = 6
const ROTATIONAL_SPEED = 0.05
const FRICTION = 0.97
const PROJECTILE_SPEED = 10

const projectiles = []
const asteroids = []

const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4)
  let x, y
  let vx, vy
  let radius = 50 * Math.random() + 10

  switch (index) {
    case 0: // left side of the screen
      x = 0 - radius
      y = Math.random() * canvas.height
      vx = 1
      vy = 0
      break
    case 1: // bottom side of the screen
      x = Math.random() * canvas.width
      y = canvas.height + radius
      vx = 0
      vy = -1
      break
    case 2: // right side of the screen
      x = canvas.width + radius
      y = Math.random() * canvas.height
      vx = -1
      vy = 0
      break
    case 3: // top side of the screen
      x = Math.random() * canvas.width
      y = 0 - radius
      vx = 0
      vy = 1
      break
  }

  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  )

  console.log(asteroids)
}, 1000)

function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x
  const yDifference = circle2.position.y - circle1.position.y

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  )

  if (distance <= circle1.radius + circle2.radius) {
    return true
  }

  return false
}

function circleTriangleCollision(circle, triangle) {
  // Check if the circle is colliding with any of the triangle's edges
  for (let i = 0; i < 3; i++) {
    let start = triangle[i]
    let end = triangle[(i + 1) % 3]

    let dx = end.x - start.x
    let dy = end.y - start.y
    let length = Math.sqrt(dx * dx + dy * dy)

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2)

    let closestX = start.x + dot * dx
    let closestY = start.y + dot * dy

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x
      closestY = closestY < start.y ? start.y : end.y
    }

    dx = closestX - circle.position.x
    dy = closestY - circle.position.y

    let distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= circle.radius) {
      return true
    }
  }

  // No collision
  return false
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  )
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  c.fillStyle = '#52B2BF'
  c.fillRect(0, 0, canvas.width, canvas.height)

  player.update()
  player2.update()

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i]
    projectile.update()

    // garbage collection for projectiles
    if (
      projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1)
    }
  }

  // asteroid management
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i]
    asteroid.update()

    if(circleTriangleCollision(asteroid, player2.getVertices())){
      window.location.reload()
    }

    if(circleTriangleCollision(asteroid, player.getVertices())){
      window.location.reload()
    }

    if(player.position.x > canvas.width) {
      player.position.x = 0
    }
    if(player.position.x < 0) {
      player.position.x = canvas.width
    }

    if(player.position.y > canvas.height) {
      player.position.y = 0
    }
    if(player.position.y < 0) {
      player.position.y = canvas.height
    }


    if(player2.position.x > canvas.width) {
      player2.position.x=0
    }
    if(player2.position.x < 0) {
      player2.position.x=canvas.width
    }

    if(player2.position.y > canvas.height) {
      player2.position.y = 0
    }
    if(player2.position.y < 0) {
      player2.position.y = canvas.height
    }

    // garbage collection for projectiles
    if (
      asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      asteroids.splice(i, 1)
    }

    // projectiles
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j]

      if (circleCollision(asteroid, projectile)) {
        asteroids.splice(i, 1)
        projectiles.splice(j, 1)
      
      }
    }
  }

  if (keys.w.pressed) {
    player.velocity.x = Math.cos(player.rotation) * SPEED
    player.velocity.y = Math.sin(player.rotation) * SPEED
  } else if (!keys.w.pressed) {
    player.velocity.x *= FRICTION
    player.velocity.y *= FRICTION
  }

  if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED
  else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED


  if (keys.ArrowUP.pressed) {
    player2.velocity.x = Math.cos(player2.rotation) * SPEED
    player2.velocity.y = Math.sin(player2.rotation) * SPEED
  } else if (!keys.w.pressed) {
    player2.velocity.x *= FRICTION
    player2.velocity.y *= FRICTION
  }

  if (keys.ArrowRight.pressed) player2.rotation += ROTATIONAL_SPEED
  else if (keys.ArrowLeft.pressed) player2.rotation -= ROTATIONAL_SPEED

}

animate()

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
      keys.w.pressed = true
      break
    case 'ArrowLeft':
      keys.a.pressed = true
      break
    case 'ArrowRight':
      keys.d.pressed = true
      break
    case 'Space':
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.cos(player.rotation) * 60,
            y: player.position.y  + Math.sin(player.rotation) * 60,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        })
      )

      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
      keys.w.pressed = false
      break
    case 'ArrowLeft':
      keys.a.pressed = false
      break
    case 'ArrowRight':
      keys.d.pressed = false
      break
  }
})


window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      keys.ArrowUP.pressed = true
      break
    case 'KeyA':
      keys.ArrowLeft.pressed = true
      break
    case 'KeyD':
      keys.ArrowRight.pressed = true
      break
    case 'KeyF':
      projectiles.push(
        new Projectile({
          position: {
            x: player2.position.x + Math.cos(player2.rotation) * 60,
            y: player2.position.y  + Math.sin(player2.rotation) * 60,
          },
          velocity: {
            x: Math.cos(player2.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player2.rotation) * PROJECTILE_SPEED,
          },
        })
      )

      break
  }
})



window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      keys.ArrowUP.pressed = false
      break
    case 'KeyA':
      keys.ArrowLeft.pressed = false
      break
    case 'KeyD':
      keys.ArrowRight.pressed = false
      break
  }
})
