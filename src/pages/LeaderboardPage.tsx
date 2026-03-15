import { useParams, Link } from "react-router-dom";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Leaderboard } from "../components/Leaderboard";
import { Spinner } from "../components/Spinner";

export function LeaderboardPage() {
  const { slug } = useParams();
  const { entries, loading } = useLeaderboard(slug ?? "");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <Link
          to={`/apps/${slug}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          Play Game
        </Link>
      </div>
      {loading ? <Spinner /> : <Leaderboard entries={entries} />}
    </div>
  );
}
