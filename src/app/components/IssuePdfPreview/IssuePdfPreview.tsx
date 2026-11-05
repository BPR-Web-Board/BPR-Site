"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import IssuePdfSkeleton from "./IssuePdfSkeleton";

const IssuePdfFlipbook = dynamic(() => import("./IssuePdfFlipbook"), {
  ssr: false,
  loading: () => <IssuePdfSkeleton />,
});

export default function IssuePdfPreview({ url, title, cover }: { url: string; title: string; cover?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return <IssuePdfSkeleton />;
  return <IssuePdfFlipbook url={url} title={title} cover={cover} />;
}
