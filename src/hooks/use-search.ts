"use client";

import { useState, useMemo } from "react";
import { searchHelpPoints } from "@/lib/search";
import type { HelpPoint } from "@/types";

export interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: HelpPoint[];
  hasQuery: boolean;
}

export function useSearch(helpPoints: HelpPoint[]): UseSearchResult {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => (query.trim() ? searchHelpPoints(query, helpPoints) : []),
    [query, helpPoints],
  );

  return {
    query,
    setQuery,
    results,
    hasQuery: query.trim().length > 0,
  };
}
