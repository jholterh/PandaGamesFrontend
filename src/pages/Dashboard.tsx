import { useApi } from "../hooks/useApi";
import { AppCard } from "../components/AppCard";
import { Spinner } from "../components/Spinner";

interface App {
  slug: string;
  name: string;
  description: string;
  author: string;
  play_count: number;
  thumbnail_url: string | null;
}

const CARD_ROTATIONS = ["-1.5deg", "0.8deg", "-0.6deg", "1.2deg", "-0.9deg", "0.5deg"];

export function Dashboard() {
  const { data: apps, loading, error } = useApi<App[]>("/api/v1/apps");

  return (
    <div className="bamboo-bg relative min-h-screen">
      {/* Floating bamboo leaves */}
      <div className="bamboo-leaf" style={{ top: "12%", left: "5%" }}>🎋</div>
      <div className="bamboo-leaf" style={{ top: "45%", right: "3%" }}>🎍</div>
      <div className="bamboo-leaf" style={{ bottom: "20%", left: "8%" }}>🌿</div>

      {/* Hero section */}
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-6 text-center">
        <div className="panda-mascot mb-4 text-6xl">🐼</div>
        <h1 className="font-nunito text-4xl font-black tracking-tight text-panda-black sm:text-5xl">
          Panda Games
        </h1>
        <p className="handwritten mx-auto mt-2 max-w-md text-2xl text-panda-green sm:text-3xl">
          by pandas, for pandas (and humans too!)
        </p>
        <div className="organic-divider mx-auto mt-6 max-w-xs" />
      </div>

      {/* Games grid */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="hand-drawn-border mx-auto max-w-sm bg-white/60 p-6 text-center">
            <p className="text-lg">😿 Oops!</p>
            <p className="mt-1 text-sm text-panda-black/60">{error}</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {apps?.map((app, i) => (
              <AppCard
                key={app.slug}
                {...app}
                rotation={CARD_ROTATIONS[i % CARD_ROTATIONS.length]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pb-8 text-center">
        <p className="handwritten text-lg text-panda-black/30">
          made with 🎋 and bamboo snacks
        </p>
      </footer>
    </div>
  );
}
