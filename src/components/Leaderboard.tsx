interface LeaderboardEntry {
  rank: number | null;
  username: string;
  score: number;
  achieved_at: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No scores yet. Be the first to play!
      </p>
    );
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-gray-200 text-sm text-gray-500">
          <th className="py-2 pr-4">#</th>
          <th className="py-2 pr-4">Player</th>
          <th className="py-2 pr-4 text-right">Score</th>
          <th className="py-2 text-right">Date</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td className="py-2 pr-4 font-medium text-gray-900">
              {entry.rank ?? i + 1}
            </td>
            <td className="py-2 pr-4 text-gray-700">{entry.username}</td>
            <td className="py-2 pr-4 text-right font-mono text-gray-900">
              {entry.score.toLocaleString()}
            </td>
            <td className="py-2 text-right text-sm text-gray-500">
              {new Date(entry.achieved_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
