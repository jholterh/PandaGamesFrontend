import { Link } from "react-router-dom";

interface AppCardProps {
  slug: string;
  name: string;
  description: string;
  author: string;
  play_count: number;
  thumbnail_url: string | null;
}

export function AppCard({
  slug,
  name,
  description,
  author,
  play_count,
  thumbnail_url,
}: AppCardProps) {
  return (
    <Link
      to={`/apps/${slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {thumbnail_url ? (
        <img
          src={thumbnail_url}
          alt={name}
          className="mb-3 h-32 w-full rounded object-cover"
        />
      ) : (
        <div className="mb-3 flex h-32 items-center justify-center rounded bg-gray-100 text-3xl">
          🎮
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>by {author}</span>
        <span>{play_count} plays</span>
      </div>
    </Link>
  );
}
