'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canChangeDirection, getFood, GRID_SIZE, SCORE_STEP, START_SNAKE, stepSnake, TICK_MS, type Direction, type Point } from '@/lib/snake-game'

const BEST_SCORE_KEY = 'slither.best-score'

function readBestScore() {
  if (typeof window === 'undefined') return 0
  const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY))
  return Number.isFinite(stored) && stored >= 0 ? stored : 0
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(START_SNAKE)
  const [food, setFood] = useState<Point>(() => getFood(START_SNAKE))
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const directionRef = useRef<Direction>('right')
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => setBest(readBestScore()), [])

  const reset = useCallback(() => {
    setSnake(START_SNAKE)
    setFood(getFood(START_SNAKE))
    directionRef.current = 'right'
    setScore(0)
    setElapsedSeconds(0)
    setGameOver(false)
    setIsPlaying(false)
    startTimeRef.current = null
  }, [])

  const start = useCallback(() => {
    if (gameOver) reset()
    setIsPlaying(true)
    startTimeRef.current ??= Date.now()
  }, [gameOver, reset])

  const setDirection = useCallback((next: Direction) => {
    if (!canChangeDirection(directionRef.current, next)) return
    directionRef.current = next
    if (!isPlaying && !gameOver) start()
  }, [gameOver, isPlaying, start])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', w: 'up',
        ArrowDown: 'down', s: 'down',
        ArrowLeft: 'left', a: 'left',
        ArrowRight: 'right', d: 'right',
      }
      const next = keyMap[event.key]

      if (next) {
        event.preventDefault()
        setDirection(next)
        return
      }

      if (event.key === ' ' || event.key === 'p') {
        event.preventDefault()
        setIsPlaying((playing) => !playing)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setDirection])

  useEffect(() => {
    if (!isPlaying || gameOver) return

    const interval = window.setInterval(() => {
      setSnake((current) => {
        const result = stepSnake(current, food, directionRef.current)

        if (result.collision) {
          setGameOver(true)
          setIsPlaying(false)
          return current
        }

        if (result.ate) {
          setScore((value) => {
            const next = value + SCORE_STEP
            setBest((currentBest) => {
              const updated = Math.max(currentBest, next)
              window.localStorage.setItem(BEST_SCORE_KEY, String(updated))
              return updated
            })
            return next
          })
          setFood(getFood(result.snake))
        }

        return result.snake
      })
    }, TICK_MS)

    return () => window.clearInterval(interval)
  }, [food, gameOver, isPlaying])

  useEffect(() => {
    if (!isPlaying || startTimeRef.current === null) return

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isPlaying])

  const cells = useMemo(
    () => Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
      x: index % GRID_SIZE,
      y: Math.floor(index / GRID_SIZE),
    })),
    [],
  )

  const formattedTime =
    String(Math.floor(elapsedSeconds / 60)).padStart(2, '0') +
    ':' +
    String(elapsedSeconds % 60).padStart(2, '0')

  const status = gameOver
    ? 'Game over. Press retry to start again.'
    : isPlaying
      ? 'Game in progress.'
      : 'Game ready. Press play or use the arrow keys.'

  return (
    <main className="game-shell">
      <div className="game-layout">
        <header className="game-header">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">✳</span>
            <span>SLITHER</span>
          </div>
          <div className="header-status">
            <span className="status-dot" aria-hidden="true" /> ARCADE MODE
            <span className="header-divider" aria-hidden="true" /> {formattedTime}
          </div>
        </header>

        <section className="game-content" aria-label="Snake game">
          <div className="game-intro">
            <p className="eyebrow">CLASSIC / 001</p>
            <h1>Grow. <span>Survive.</span></h1>
            <p className="intro-copy">Navigate the grid. Eat the signal. Don&apos;t hit the walls.</p>
          </div>

          <div className="score-row" aria-label="Game statistics">
            <div><span className="metric-label">SCORE</span><strong>{String(score).padStart(4, '0')}</strong></div>
            <div><span className="metric-label">BEST</span><strong>{String(best).padStart(4, '0')}</strong></div>
          </div>

          <p className="sr-only" aria-live="polite">{status} Score {score}. Best {best}.</p>

          <div className="board-wrap">
            <div className="board" role="grid" aria-label="Snake playfield">
              {cells.map((cell) => {
                const snakeIndex = snake.findIndex((part) => part.x === cell.x && part.y === cell.y)
                const isFood = food.x === cell.x && food.y === cell.y
                const isHead = snakeIndex === 0

                return (
                  <div
                    key={cell.x + '-' + cell.y}
                    className={'cell ' + (snakeIndex >= 0 ? 'snake-cell ' : '') + (isHead ? 'snake-head ' : '') + (isFood ? 'food-cell' : '')}
                    role="gridcell"
                    aria-label={isHead ? 'Snake head' : isFood ? 'Food' : undefined}
                  />
                )
              })}
              {!isPlaying && (
                <div className="board-overlay">
                  <div className="overlay-icon" aria-hidden="true">{gameOver ? '×' : '▶'}</div>
                  <p>{gameOver ? 'SIGNAL LOST' : 'READY?'}</p>
                  <span>{gameOver ? 'Press retry to play again' : 'Press play or use arrow keys'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="controls-row">
            <div className="d-pad" aria-label="Directional controls">
              <Button className="d-pad-up" variant="outline" size="icon-lg" aria-label="Move up" onClick={() => setDirection('up')}>↑</Button>
              <Button className="d-pad-left" variant="outline" size="icon-lg" aria-label="Move left" onClick={() => setDirection('left')}>←</Button>
              <Button className="d-pad-down" variant="outline" size="icon-lg" aria-label="Move down" onClick={() => setDirection('down')}>↓</Button>
              <Button className="d-pad-right" variant="outline" size="icon-lg" aria-label="Move right" onClick={() => setDirection('right')}>→</Button>
            </div>

            <div className="action-buttons">
              <Button className="play-button" onClick={() => isPlaying ? setIsPlaying(false) : start()}>
                {isPlaying ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
                {isPlaying ? 'PAUSE' : gameOver ? 'RETRY' : 'PLAY'}
              </Button>
              <Button variant="outline" size="icon-lg" aria-label="Restart game" onClick={reset}><RotateCcw /></Button>
            </div>
          </div>

          <p className="hint"><kbd>ARROW KEYS</kbd> or <kbd>WASD</kbd> to move <span>•</span> <kbd>SPACE</kbd> to pause</p>
        </section>
      </div>

      <footer className="game-footer">
        <span>© 2026 SLITHER</span>
        <span>BUILT FOR THE NIGHT <i aria-hidden="true" /></span>
      </footer>
    </main>
  )
}

export default SnakeGame
