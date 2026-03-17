import { useState, useCallback } from "react";

const AI_URL = import.meta.env.VITE_AI_URL || "https://travel-mate-ai.hy57in.workers.dev";

interface GenerateParams {
  destination: string;
  days: number;
  travelers: number;
  style: string;
}

export default function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async ({ destination, days, travelers, style }: GenerateParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, travelers, style }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "AI 요청 실패");
      }
      return await res.json();
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
