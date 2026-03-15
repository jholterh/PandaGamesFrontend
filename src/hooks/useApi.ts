import { useState, useEffect } from "react";
import api from "../api/client";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<T>(url)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Request failed"))
      .finally(() => setLoading(false));
  }, [url, fetchKey]);

  const refetch = () => setFetchKey((k) => k + 1);

  return { data, loading, error, refetch };
}
