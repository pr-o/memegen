"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MemeEntry {
  id: string;
  url: string;
  createdAt: { seconds: number } | null;
}

function MemeCard({ entry }: { entry: MemeEntry }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="relative aspect-square w-full bg-[#111]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        <Image
          src={entry.url}
          alt="meme"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          unoptimized
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<MemeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "memes"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    getDocs(q)
      .then((snap) => {
        setEntries(
          snap.docs.map((doc) => ({
            id: doc.id,
            url: doc.data().url as string,
            createdAt: doc.data().createdAt as { seconds: number } | null,
          }))
        );
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#111]">
      {/* Header */}
      <header className="relative flex h-12 shrink-0 items-center border-b border-[#2a2a2a] bg-[#1a1a1a] px-4">
        <span className="text-base font-bold tracking-wide text-foreground">
          Meme Generator
        </span>
        <Link
          href="/create"
          className="absolute left-1/2 -translate-x-1/2 rounded-md bg-[#3b82f6] px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          Create Meme
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Recent Memes
        </h1>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {!loading && entries.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No memes yet. Be the first!
            </p>
            <Link
              href="/create"
              className="rounded-md bg-[#3b82f6] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
            >
              Create Meme
            </Link>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {entries.map((entry) => (
              <MemeCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
