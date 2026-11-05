import WordPressContentPage from "../../components/WordPressContentPage/WordPressContentPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pitch an Article | Brown Political Review" };

export default function Page() {
  return <WordPressContentPage slug="write-for-bpr" />;
}
