'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Point = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

const GRID_SIZE = 20
const START_SNAKE: Point[] = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
]
const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function getFood(snake: Point[]): Point {
  const open: Point[] = []
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) open.push({ x, y })
    }
  }
  return open[Math.floor(Math.random() * open.length)] ?? { x: 15, y: 10 }
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(START_SNAKE)
  const [food, setFood] = useState<Point>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<Direction>('right')
  const directionRef = useRef<Direction>('right')
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(1240)
  const [muted, setMuted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const reset = useCallback(() => {
    setSnake(START_SNAKE)
    setFood(getFood(START_SNAKE))
    directionRef.current = 'right'
    setDirection('right')
    setScore(0)
    setGameOver(false)
    setIsPlaying(false)
  }, [])

  const start = () => {
    if (gameOver) reset()
    setIsPlaying(true)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }
      const next = keyMap[event.key]
      if (next) {
        event.preventDefault()
        const current = directionRef.current
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' }
        if (opposite[current] !== next) {
          directionRef.current = next
          setDirection(next)
          if (!isPlaying && !gameOver) setIsPlaying(true)
        }
      }
      if (event.key === ' ' || event.key === 'p') setIsPlaying((playing) => !playing)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameOver, isPlaying])

  useEffect(() => {
    if (!isPlaying || gameOver) return
    const interval = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0]
        const delta = DIRECTIONS[directionRef.current]
        const nextHead = { x: head.x + delta.x, y: head.y + delta.y }
        const hitWall = nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE
        const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y)
        if (hitWall || hitSelf) {
          setGameOver(true)
          setIsPlaying(false)
          return current
        }
        const ate = nextHead.x === food.x && nextHead.y === food.y
        const nextSnake = ate ? [nextHead, ...current] : [nextHead, ...current.slice(0, -1)]
        if (ate) {
          setScore((value) => {
            const next = value + 10
            setBest((currentBest) => Math.max(currentBest, next))
            return next
          })
          setFood(getFood(nextSnake))
        }
        return nextSnake
      })
    }, 125)
    return () => window.clearInterval(interval)
  }, [food, gameOver, isPlaying])

  const cells = useMemo(() => Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({ x: index % GRID_SIZE, y: Math.floor(index / GRID_SIZE) })), [])

  return (
    <main className="game-shell">
      <div className="game-layout">
        <header className="game-header">
          <div className="brand-lockup"><span className="brand-mark">✳</span><span>NEON//SNAKE</span></div>
          <div className="header-status"><span className="status-dot" /> ARCADE MODE <span className="header-divider" /> 01:24</div>
        </header>

        <section className="game-content" aria-label="Snake game">
          <div className="game-intro">
            <p className="eyebrow">CLASSIC / 001</p>
            <h1>Grow. <span>Survive.</span></h1>
            <p className="intro-copy">Navigate the grid. Eat the signal. Don&apos;t hit the walls.</p>
          </div>

          <div className="score-row">
            <div><span className="metric-label">SCORE</span><strong>{String(score).padStart(4, '0')}</strong></div>
            <div><span className="metric-label">BEST</span><strong>{String(best).padStart(4, '0')}</strong></div>
            <div className="level-chip"><span className="pulse-dot" /> LEVEL 01</div>
          </div>

          <div className="board-wrap">
            <div className="board" role="grid" aria-label="Snake playfield">
              {cells.map((cell) => {
                const snakeIndex = snake.findIndex((part) => part.x === cell.x && part.y === cell.y)
                const isFood = food.x === cell.x && food.y === cell.y
                const isHead = snakeIndex === 0
                return <div key={`${cell.x}-${cell.y}`} className={`cell ${snakeIndex >= 0 ? 'snake-cell' : ''} ${isHead ? 'snake-head' : ''} ${isFood ? 'food-cell' : ''}`} role="gridcell" aria-label={isFood ? 'Food' : undefined} />
              })}
              {!isPlaying && <div className="board-overlay"><div className="overlay-icon">{gameOver ? '×' : '▶'}</div><p>{gameOver ? 'SIGNAL LOST' : 'READY?'}</p><span>{gameOver ? 'Press restart to try again' : 'Press play or use arrow keys'}</span></div>}
            </div>
          </div>

          <div className="controls-row">
            <div className="d-pad" aria-label="Directional controls">
              <Button className="d-pad-up" variant="outline" size="icon" aria-label="Move up" onClick={() => { directionRef.current = 'up'; setDirection('up'); setIsPlaying(true) }}>↑</Button>
              <Button className="d-pad-left" variant="outline" size="icon" aria-label="Move left" onClick={() => { directionRef.current = 'left'; setDirection('left'); setIsPlaying(true) }}>←</Button>
              <Button className="d-pad-down" variant="outline" size="icon" aria-label="Move down" onClick={() => { directionRef.current = 'down'; setDirection('down'); setIsPlaying(true) }}>↓</Button>
              <Button className="d-pad-right" variant="outline" size="icon" aria-label="Move right" onClick={() => { directionRef.current = 'right'; setDirection('right'); setIsPlaying(true) }}>→</Button>
            </div>
            <div className="action-buttons">
              <Button className="play-button" onClick={() => isPlaying ? setIsPlaying(false) : start()}>{isPlaying ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />} {isPlaying ? 'PAUSE' : gameOver ? 'RETRY' : 'PLAY'}</Button>
              <Button variant="outline" size="icon" aria-label="Restart game" onClick={reset}><RotateCcw /></Button>
              <Button variant="outline" size="icon" aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} onClick={() => setMuted(!muted)}>{muted ? <VolumeX /> : <Volume2 />}</Button>
            </div>
          </div>
          <p className="hint"><kbd>ARROW KEYS</kbd> or <kbd>WASD</kbd> to move <span>•</span> <kbd>SPACE</kbd> to pause</p>
        </section>
      </div>
      <footer className="game-footer"><span>© 2024 NEON//SNAKE</span><span>BUILT FOR THE NIGHT <i /></span></footer>
    </main>
  )
}

export default SnakeGame

