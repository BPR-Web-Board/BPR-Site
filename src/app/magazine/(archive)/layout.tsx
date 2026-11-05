import type { ReactNode } from "react";
import MagazineNavigation from "../../components/MagazineNavigation/MagazineNavigation";
import "../../mainStyle.css";
import "../../components/WordPressPuzzlePage/content-pages.css";
import "./archive.css";

export const metadata = { title: "Archive | Brown Political Review" };

export default function ArchiveLayout({ children }: { children: ReactNode }) {
  return <main className="page-container">
    <div className="archive-content">
      <header className="archive-header"><h1 className="archive-title">Archive</h1></header>
      <MagazineNavigation />
      <div className="archive-panel">{children}</div>
    </div>
  </main>;
}
