import WordPressContentPage from "../../components/WordPressContentPage/WordPressContentPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "About BPR | Brown Political Review" };

export default function Page() {
  return <WordPressContentPage slug="about" />;
}
