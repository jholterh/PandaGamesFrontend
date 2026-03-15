import { useParams } from "react-router-dom";
import { SnakeGame } from "../apps/snake-game/SnakeGame";
import { TicTacToe } from "../apps/tic-tac-toe/TicTacToe";
import { MemoryCards } from "../apps/memory-cards/MemoryCards";
import { NotFound } from "./NotFound";

const gameRegistry: Record<string, React.ComponentType> = {
  "snake-game": SnakeGame,
  "tic-tac-toe": TicTacToe,
  "memory-cards": MemoryCards,
};

export function AppPage() {
  const { slug } = useParams();
  const Game = gameRegistry[slug ?? ""];
  if (!Game) return <NotFound />;
  return <Game />;
}
