"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { searchPlaces, type GeocodeResult } from "@/lib/geocoding/nominatim";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 450;

interface LocationSearchProps {
  onSelect: (result: GeocodeResult) => void;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  // Picking a result rewrites the input; that must not start a new search.
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setSearched(false);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(trimmed, controller.signal);
        if (cancelled) return;
        setResults(found);
        setActiveIndex(0);
        setError(null);
        setOpen(true);
      } catch {
        if (cancelled) return;
        setResults([]);
        setError("Place search is unavailable right now.");
        setOpen(true);
      } finally {
        if (!cancelled) {
          setSearched(true);
          setSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const select = (result: GeocodeResult) => {
    skipNextSearchRef.current = true;
    setQuery(result.label);
    setResults([]);
    setSearched(false);
    setOpen(false);
    onSelect(result);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setSearched(false);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const result = results[activeIndex];
      if (result) select(result);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    if (results.length === 0) return;
    setOpen(true);
    setActiveIndex((current) => {
      const step = event.key === "ArrowDown" ? 1 : -1;
      return (current + step + results.length) % results.length;
    });
  };

  const showPanel = open && (error !== null || results.length > 0 || searched);

  return (
    <div ref={rootRef} className="w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cs-subtle" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search for a place to start drawing"
          aria-label="Search for a place"
          className="w-full rounded-lg border border-cs-border bg-cs-overlay py-2.5 pl-9 pr-16 text-sm text-cs-text shadow-lg backdrop-blur-sm placeholder:text-cs-subtle focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {searching && (
            <LoaderCircle className="h-4 w-4 animate-spin text-emerald-500" />
          )}
          {query.length > 0 && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="text-cs-subtle transition-colors hover:text-cs-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showPanel && (
        <div className="mt-2 overflow-hidden rounded-lg border border-cs-border bg-cs-overlay shadow-xl backdrop-blur-sm">
          {error && <p className="px-3 py-2.5 text-xs text-amber-300">{error}</p>}

          {!error && results.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-cs-subtle">
              No places matched that search.
            </p>
          )}

          {!error && results.length > 0 && (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => select(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`block w-full px-3 py-2 text-left text-xs leading-relaxed transition-colors ${
                      index === activeIndex
                        ? "bg-cs-hover text-cs-text"
                        : "text-cs-muted"
                    }`}
                  >
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
