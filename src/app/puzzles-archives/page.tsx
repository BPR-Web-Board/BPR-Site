import WordPressPuzzlePage from "../components/WordPressPuzzlePage/WordPressPuzzlePage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puzzles Archives | Brown Political Review" };

export default function PuzzlesArchivesPage() {
  return <WordPressPuzzlePage slug="puzzles-archives" />;
}
