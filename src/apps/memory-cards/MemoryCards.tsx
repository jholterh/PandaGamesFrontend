import { Link } from "react-router-dom";

export function MemoryCards() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-gray-900">Memory Cards</h1>
      <p className="mt-2 text-gray-500">Coming soon!</p>
      <Link
        to="/"
        className="mt-4 text-sm text-indigo-600 hover:underline"
      >
        Back to Games
      </Link>
    </div>
  );
}
