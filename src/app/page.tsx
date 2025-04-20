import Image from "next/image";
import Footer from "./components/Footer/Footer";
import NavigationBar from "./components/NavigationBar/NavigationBar";
import ArticleHero from "./components/ArticleHero/ArticleHero";

export default function Home() {
  return (
    <div className="">
      <NavigationBar />
      <main className="">
        <Image
          src="/logo/logo.svg"
          alt="The Brown Political Review Logo"
          width={280}
          height={70}
          priority
        />
      </main>
      <Footer />
    </div>
  );
}
