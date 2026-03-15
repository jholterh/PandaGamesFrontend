import { useRef, useEffect, useState, useCallback } from "react";
import { ScoreDisplay } from "../../components/ScoreDisplay";
import { GameOverModal } from "../../components/GameOverModal";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/client";

const CELL_SIZE = 20;
const GRID_W = 20;
const GRID_H = 20;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const { isAuthenticated } = useAuth();

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>(randomFood(snakeRef.current));
  const dirRef = useRef<Direction>("RIGHT");
  const nextDirRef = useRef<Direction>("RIGHT");
  const speedRef = useRef(INITIAL_SPEED);
  const loopRef = useRef<number>(0);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // grid lines
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(CANVAS_W, y * CELL_SIZE);
      ctx.stroke();
    }

    // snake
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
      ctx.fillRect(
        seg.x * CELL_SIZE + 1,
        seg.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // food
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = { ...snake[0] };

    switch (dirRef.current) {
      case "UP":    head.y--; break;
      case "DOWN":  head.y++; break;
      case "LEFT":  head.x--; break;
      case "RIGHT": head.x++; break;
    }

    // wall collision
    if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
      return true;
    }

    // self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      return true;
    }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      foodRef.current = randomFood(snake);
      setScore((s) => s + 10);
      speedRef.current = Math.max(50, speedRef.current - SPEED_INCREMENT);
    } else {
      snake.pop();
    }

    return false;
  }, []);

  const submitScore = useCallback(
    async (finalScore: number) => {
      if (!isAuthenticated || finalScore === 0) return;
      try {
        await api.post("/api/v1/apps/snake-game/scores", {
          score: finalScore,
          metadata: { food_eaten: finalScore / 10 },
        });
      } catch {
        // score submission failed silently
      }
    },
    [isAuthenticated]
  );

  const gameLoop = useCallback(() => {
    const dead = tick();
    draw();
    if (dead) {
      setGameOver(true);
      setScore((s) => {
        submitScore(s);
        return s;
      });
      return;
    }
    loopRef.current = window.setTimeout(gameLoop, speedRef.current);
  }, [tick, draw, submitScore]);

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = randomFood(snakeRef.current);
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    clearTimeout(loopRef.current);
    // Small delay so state updates before loop starts
    setTimeout(gameLoop, 100);
  }, [gameLoop]);

  useEffect(() => {
    draw(); // draw initial state
  }, [draw]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":    if (dir !== "DOWN")  nextDirRef.current = "UP";    break;
        case "ArrowDown":  if (dir !== "UP")    nextDirRef.current = "DOWN";  break;
        case "ArrowLeft":  if (dir !== "RIGHT") nextDirRef.current = "LEFT";  break;
        case "ArrowRight": if (dir !== "LEFT")  nextDirRef.current = "RIGHT"; break;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(loopRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Snake Game</h1>
      <ScoreDisplay score={score} />

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded border border-gray-300"
      />

      {!started && !gameOver && (
        <button
          onClick={startGame}
          className="rounded bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Start Game
        </button>
      )}

      {gameOver && (
        <GameOverModal
          score={score}
          appSlug="snake-game"
          onPlayAgain={startGame}
        />
      )}
    </div>
  );
}
