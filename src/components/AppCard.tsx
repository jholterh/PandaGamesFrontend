import { Link } from "react-router-dom";

interface AppCardProps {
  slug: string;
  name: string;
  description: string;
  author: string;
  play_count: number;
  thumbnail_url: string | null;
  rotation?: string;
}

const GAME_EMOJIS: Record<string, string> = {
  "snake-game": "🐍",
  "tic-tac-toe": "⭕",
  "memory-cards": "🃏",
};

const STICKER_COLORS = [
  "bg-panda-green-pale text-panda-green",
  "bg-panda-pink/20 text-panda-orange",
  "bg-bamboo/15 text-bamboo-dark",
];

export function AppCard({
  slug,
  name,
  description,
  author,
  play_count,
  thumbnail_url,
  rotation = "0deg",
}: AppCardProps) {
  const emoji = GAME_EMOJIS[slug] ?? "🎮";
  const stickerIdx = Object.keys(GAME_EMOJIS).indexOf(slug);
  const stickerColor = STICKER_COLORS[stickerIdx >= 0 ? stickerIdx : 0];

  return (
    <Link
      to={`/apps/${slug}`}
      className="game-card block rounded-2xl border-2 border-panda-green/15 bg-white p-5 shadow-sm"
      style={{ "--card-rotate": rotation } as React.CSSProperties}
    >
      {thumbnail_url ? (
        <img
          src={thumbnail_url}
          alt={name}
          className="mb-3 h-36 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-3 flex h-36 items-center justify-center rounded-xl bg-panda-green-pale/50">
          <span className="text-5xl">{emoji}</span>
        </div>
      )}
      <h3 className="font-nunito text-lg font-extrabold text-panda-black">{name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-panda-black/55 line-clamp-2">
        {description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-panda-black/40">
          🐼 {author}
        </span>
        <span className={`sticker ${stickerColor}`}>
          {play_count} plays
        </span>
      </div>
    </Link>
  );
}
