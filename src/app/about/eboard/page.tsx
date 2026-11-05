import WordPressContentPage from "../../components/WordPressContentPage/WordPressContentPage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Executive Board | Brown Political Review" };

export default function Page() {
  return <WordPressContentPage slug="masthead" section="Executive Board" />;
}
