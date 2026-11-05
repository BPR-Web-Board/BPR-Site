import WordPressPuzzlePage from "../components/WordPressPuzzlePage/WordPressPuzzlePage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Puzzles | Brown Political Review" };

export default function PuzzlesPage() {
  return <WordPressPuzzlePage slug="puzzles" />;
}
