export type Point = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'

export const GRID_SIZE = 20
export const TICK_MS = 125
export const SCORE_STEP = 10

export const START_SNAKE: Point[] = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
]

export const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export function canChangeDirection(current: Direction, next: Direction) {
  return OPPOSITE[current] !== next
}

export function isSamePoint(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y
}

export function getNextHead(head: Point, direction: Direction): Point {
  const delta = DIRECTIONS[direction]
  return { x: head.x + delta.x, y: head.y + delta.y }
}

export function isWallCollision(point: Point) {
  return point.x < 0 || point.x >= GRID_SIZE || point.y < 0 || point.y >= GRID_SIZE
}

export function getFood(snake: Point[], random = Math.random): Point {
  const occupied = new Set(snake.map((part) => part.y * GRID_SIZE + part.x))
  const open: Point[] = []

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!occupied.has(y * GRID_SIZE + x)) open.push({ x, y })
    }
  }

  return open[Math.floor(random() * open.length)] ?? { x: 0, y: 0 }
}

export type StepResult = {
  snake: Point[]
  ate: boolean
  collision: boolean
}

export function stepSnake(snake: Point[], food: Point, direction: Direction): StepResult {
  const nextHead = getNextHead(snake[0], direction)
  const ate = isSamePoint(nextHead, food)
  const bodyToCheck = ate ? snake : snake.slice(0, -1)
  const collision = isWallCollision(nextHead) || bodyToCheck.some((part) => isSamePoint(part, nextHead))

  if (collision) return { snake, ate: false, collision: true }

  return {
    snake: [nextHead, ...snake.slice(0, ate ? undefined : -1)],
    ate,
    collision: false,
  }
}
