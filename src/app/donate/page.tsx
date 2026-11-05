import WordPressContentPage from "../components/WordPressContentPage/WordPressContentPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Donate | Brown Political Review" };

export default function Page() {
  return <WordPressContentPage slug="donate" />;
}
