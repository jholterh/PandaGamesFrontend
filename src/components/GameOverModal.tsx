import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface GameOverModalProps {
  score: number;
  appSlug: string;
  onPlayAgain: () => void;
}

export function GameOverModal({
  score,
  appSlug,
  onPlayAgain,
}: GameOverModalProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900">Game Over!</h2>
        <p className="mt-2 text-4xl font-bold text-indigo-600">
          {score.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">points</p>

        {!isAuthenticated && (
          <p className="mt-3 text-sm text-amber-600">
            <Link to="/sign-in" className="underline">
              Sign in
            </Link>{" "}
            to save your score!
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            Play Again
          </button>
          <Link
            to={`/leaderboards/${appSlug}`}
            className="flex-1 rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
