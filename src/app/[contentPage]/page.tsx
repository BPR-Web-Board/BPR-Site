import { notFound } from "next/navigation";
import WordPressContentPage from "../components/WordPressContentPage/WordPressContentPage";
import WordPressPuzzlePage from "../components/WordPressPuzzlePage/WordPressPuzzlePage";

export const revalidate = 300;

// Generate on the first visit, then cache without requiring the CMS at build time.
export function generateStaticParams() { return []; }

type PageProps = { params: Promise<{ contentPage: string }> };
const titles: Record<string, string> = {
  donate: "Donate",
  puzzles: "Puzzles",
  "puzzles-archives": "Puzzles Archives",
};

function getTitle(slug: string) {
  if (!Object.prototype.hasOwnProperty.call(titles, slug)) notFound();
  return titles[slug];
}

export async function generateMetadata({ params }: PageProps) {
  return { title: `${getTitle((await params).contentPage)} | Brown Political Review` };
}

export default async function Page({ params }: PageProps) {
  const { contentPage } = await params;
  getTitle(contentPage);
  return contentPage === "donate"
    ? <WordPressContentPage slug={contentPage} />
    : <WordPressPuzzlePage slug={contentPage} />;
}
