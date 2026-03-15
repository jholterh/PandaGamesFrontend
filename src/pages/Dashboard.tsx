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

export function Dashboard() {
  const { data: apps, loading, error } = useApi<App[]>("/api/v1/apps");

  if (loading) return <Spinner />;
  if (error)
    return <p className="py-8 text-center text-red-500">{error}</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Games</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps?.map((app) => (
          <AppCard key={app.slug} {...app} />
        ))}
      </div>
    </div>
  );
}
