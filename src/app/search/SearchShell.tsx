"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import SearchResultsSkeleton from "./SearchResultsSkeleton";

export default function SearchShell({
  query,
  children,
}: {
  query: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = value.trim().slice(0, 280);
    if (!next) return;
    startTransition(() => {
      router.push(`/search?${new URLSearchParams({ q: next })}`);
    });
  };

  return (
    <>
      <form className="content-search-form" role="search" onSubmit={onSubmit}>
        <input
          type="search"
          name="q"
          aria-label="Search articles"
          placeholder="Search articles…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={280}
          required
        />
        <button
          type="submit"
          className="content-search-submit"
          aria-label="Search"
          disabled={isPending}
        >
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </form>
      {isPending ? (
        <SearchResultsSkeleton query={value.trim()} />
      ) : (
        children
      )}
    </>
  );
}
