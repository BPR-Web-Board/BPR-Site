import { notFound } from "next/navigation";
import WordPressContentPage from "../../components/WordPressContentPage/WordPressContentPage";

export const revalidate = 300;

// Generate on the first visit so a CMS outage cannot fail the build here.
export function generateStaticParams() { return []; }

type PageProps = { params: Promise<{ page: string }> };
const pages: Record<string, { slug: string; title: string; section?: string }> = {
  "masthead": { slug: "masthead", title: "Masthead" },
  "join": { slug: "join", title: "Join BPR" },
  "story": { slug: "about", title: "About BPR" },
  "pitch": { slug: "write-for-bpr", title: "Pitch an Article" },
  "eboard": { slug: "masthead", title: "Executive Board", section: "Executive Board" },
  "high-school-program": { slug: "high-school-program", title: "High School Program" },
};

function getPage(key: string) {
  if (!Object.prototype.hasOwnProperty.call(pages, key)) notFound();
  return pages[key];
}

export async function generateMetadata({ params }: PageProps) {
  return { title: `${getPage((await params).page).title} | Brown Political Review` };
}

export default async function Page({ params }: PageProps) {
  const { slug, section } = getPage((await params).page);
  return <WordPressContentPage slug={slug} section={section} />;
}
