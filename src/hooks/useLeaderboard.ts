import { useState, useEffect } from "react";
import { createConsumer } from "@rails/actioncable";
import api from "../api/client";

interface LeaderboardEntry {
  rank: number | null;
  username: string;
  score: number;
  achieved_at: string;
}

const cableUrl =
  (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
    /^http/,
    "ws"
  ) + "/cable";

export function useLeaderboard(appSlug: string, limit = 10) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/v1/apps/${appSlug}/leaderboard?limit=${limit}`)
      .then((res) => setEntries(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appSlug, limit]);

  useEffect(() => {
    const consumer = createConsumer(cableUrl);
    const subscription = consumer.subscriptions.create(
      { channel: "LeaderboardChannel", app_slug: appSlug },
      {
        received(data: { username: string; score: number }) {
          setEntries((prev) => {
            const next = [
              ...prev,
              {
                rank: null,
                username: data.username,
                score: data.score,
                achieved_at: new Date().toISOString(),
              },
            ];
            next.sort((a, b) => b.score - a.score);
            return next.slice(0, limit);
          });
        },
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [appSlug, limit]);

  return { entries, loading };
}
