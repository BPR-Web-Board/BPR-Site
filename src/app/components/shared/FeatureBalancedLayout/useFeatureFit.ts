"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fitArticlesToHeight, fitStackedSideColumns, FittedArticles } from "../../../lib/fitArticlesToHeight";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function useFeatureFit(ids: number[], columnCount: number, breakpoint: number, revision: unknown) {
  const rootRef = useRef<HTMLDivElement>(null);
  const key = ids.join(",");
  const [fitted, setFitted] = useState<(FittedArticles & { key: string }) | null>(null);
  const initial: FittedArticles = {
    columns: Array.from({ length: columnCount }, (_, index) => ids.filter((_, position) => position % columnCount === index)),
    overflow: [],
  };

  useBrowserLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    let disposed = false;
    const media = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const apply = (next: FittedArticles) => {
      setFitted(previous => previous?.key === key && JSON.stringify(previous.columns) === JSON.stringify(next.columns) && JSON.stringify(previous.overflow) === JSON.stringify(next.overflow)
        ? previous : { ...next, key });
    };
    const measure = () => {
      frame = 0;
      if (disposed || !root.isConnected) return;
      if (!media.matches) {
        root.style.removeProperty("--feature-height");
        root.style.removeProperty("--feature-min-height");
        root.style.removeProperty("--feature-image-height");
        apply({ columns: Array.from({ length: columnCount }, () => []), overflow: key ? key.split(",").map(Number) : [] });
        return;
      }
      const feature = root.querySelector<HTMLElement>(".feature-height-source");
      const sideColumns = Array.from(root.querySelectorAll<HTMLElement>("[data-side-column]"));
      const width = Math.min(...sideColumns.map(column => column.getBoundingClientRect().width));
      if (!feature || !width || !Number.isFinite(width)) return;
      const featureImage = feature.querySelector<HTMLElement>(
        ".featured-article-image-container, .large-article-preview-image-container, [class*='image-container']"
      );
      const slots = Array.from(root.querySelectorAll<HTMLElement>("[data-fit-id]"));
      const host = document.createElement("div");
      host.inert = true;
      host.setAttribute("aria-hidden", "true");
      Object.assign(host.style, { position: "absolute", left: "-100000px", top: "0", width: `${width}px`, visibility: "hidden", pointerEvents: "none" });
      const clones = slots.flatMap(slot => {
        const card = slot.querySelector<HTMLElement>(".feature-side-card");
        if (!card) return [];
        const clone = card.cloneNode(true) as HTMLElement;
        clone.classList.remove("feature-side-card--stacked");
        clone.querySelectorAll(".small-article-excerpt").forEach(element => element.remove());
        Object.assign(clone.style, { width: `${width}px`, height: "auto", minHeight: "0", flex: "none", alignSelf: "start" });
        clone.querySelectorAll("img, source").forEach(image => { image.removeAttribute("src"); image.removeAttribute("srcset"); });
        clone.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
        host.appendChild(clone);
        return [{ id: Number(slot.dataset.fitId), clone }];
      });
      root.appendChild(host);
      const measurements = new Map(clones.map(({ id, clone }) => [id, clone.getBoundingClientRect().height]));
      clones.forEach(({ clone }) => clone.classList.add("feature-side-card--stacked"));
      const stackedHeights = new Map(clones.map(({ id, clone }) => [id, clone.getBoundingClientRect().height]));
      host.remove();
      const measured = (key ? key.split(",").map(Number) : []).map(id => ({ id, height: measurements.get(id) || 0 }));
      if (!measured.length || measured.some(article => article.height <= 0)) return;
      const minimum = measured.map(article => article.height).sort((a, b) => a - b)[Math.min(columnCount, measured.length) - 1];
      if (Math.abs(parseFloat(root.style.getPropertyValue("--feature-min-height")) - minimum) > .5 || !root.style.getPropertyValue("--feature-min-height")) {
        root.style.setProperty("--feature-min-height", `${minimum}px`);
      }
      const compactHeight = feature.getBoundingClientRect().height;
      const gap = parseFloat(getComputedStyle(sideColumns[0]).rowGap) || 0;
      const compact = fitArticlesToHeight(measured, compactHeight, gap, columnCount);
      const stackedMinimum = Math.max(minimum, ...compact.columns
        .filter(column => column.length > 0 && column.length < 4)
        .map(column => Math.min(...column.map(id => stackedHeights.get(id) || 0))));
      if (stackedMinimum > minimum + .5) root.style.setProperty("--feature-min-height", `${stackedMinimum}px`);
      const height = feature.getBoundingClientRect().height;
      if (Math.abs(parseFloat(root.style.getPropertyValue("--feature-height")) - height) > .5 || !root.style.getPropertyValue("--feature-height")) {
        root.style.setProperty("--feature-height", `${height}px`);
      }
      const imageHeight = featureImage?.getBoundingClientRect().height || 0;
      if (imageHeight > 0) {
        if (Math.abs(parseFloat(root.style.getPropertyValue("--feature-image-height")) - imageHeight) > .5 || !root.style.getPropertyValue("--feature-image-height")) {
          root.style.setProperty("--feature-image-height", `${imageHeight}px`);
        }
      } else {
        root.style.removeProperty("--feature-image-height");
      }
      const stacked = measured.map(article => ({ id: article.id, height: stackedHeights.get(article.id) || article.height }));
      apply(fitStackedSideColumns(compact, stacked, height, gap));
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    const feature = root.querySelector<HTMLElement>(".feature-height-source");
    if (feature) observer.observe(feature);
    const featureImage = feature?.querySelector<HTMLElement>(
      ".featured-article-image-container, .large-article-preview-image-container, [class*='image-container']"
    );
    if (featureImage) observer.observe(featureImage);
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    document.fonts?.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      document.fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [key, columnCount, breakpoint, revision]);

  return { rootRef, layout: fitted?.key === key ? fitted : initial };
}
