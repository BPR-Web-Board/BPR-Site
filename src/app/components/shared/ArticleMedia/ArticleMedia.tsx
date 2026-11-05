import { ChartColumn, Headphones, Images, Play } from "lucide-react";
import { getMediaPreview } from "../../../lib/mediaPreview";
import type { EnhancedPost, MediaPreview } from "../../../lib/types";
import { getArticleTitle, stripHtml } from "../../../lib/utils";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import "./ArticleMedia.css";

const labels = { audio: "Audio", video: "Video", gallery: "Photos", data: "Data", media: "Media" };

export default function ArticleMedia({ article, className = "", sizes = "(max-width: 768px) 100vw, 50vw", priority = false, fallbackType }: {
  article: EnhancedPost;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackType?: MediaPreview["type"];
}) {
  const media = getMediaPreview(article) || (fallbackType ? { type: fallbackType } : null);
  const src = article.featured_media_obj?.source_url || media?.thumbnail;
  const Icon = media?.type === "audio" ? Headphones : media?.type === "gallery" ? Images : media?.type === "data" ? ChartColumn : Play;
  const BadgeIcon = media?.type === "gallery" ? Images : media?.type === "data" ? ChartColumn : Play;
  const showBadge = !!src && !!media && (media.type === "audio" || media.type === "video" || media.type === "gallery" || media.type === "data");
  const placeholder = <div className="article-media-placeholder" role="img" aria-label={`${media ? labels[media.type] : "Media"} preview unavailable`}>
    <Icon className="article-media-placeholder-icon" strokeWidth={1.5} aria-hidden="true" />
    <span>{media ? labels[media.type] : "Media"}</span>
  </div>;
  return <>
    {src ? <OptimizedImage src={src} alt={stripHtml(getArticleTitle(article))} fill sizes={sizes}
      className={className} priority={priority} showPlaceholder errorFallback={placeholder} /> : placeholder}
    {showBadge ? <span className="article-media-badge">
      <BadgeIcon size={14} strokeWidth={1.5} aria-hidden="true" />{labels[media!.type]}
    </span> : null}
  </>;
}
