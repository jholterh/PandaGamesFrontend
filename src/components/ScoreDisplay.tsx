interface ScoreDisplayProps {
  score: number;
  label?: string;
}

export function ScoreDisplay({ score, label = "Score" }: ScoreDisplayProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded bg-gray-900 px-4 py-2 font-mono text-white">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-lg font-bold">{score.toLocaleString()}</span>
    </div>
  );
}
