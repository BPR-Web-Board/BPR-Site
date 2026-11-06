/** @jest-environment jsdom */
import React from "react";
import ArticleArchivePage from "../../magazine/(archive)/archive/page";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArticlePreviewGrid from "../../components/ArticlePreviewGrid/ArticlePreviewGrid";
import ArticleCard from "../../components/shared/ArticleCard/ArticleCard";
import ArticleMedia from "../../components/shared/ArticleMedia/ArticleMedia";
import InfiniteScrollArticleList from "../../components/shared/InfiniteScrollArticleList/InfiniteScrollArticleList";
import type { EnhancedPost } from "../types";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import MagazineNavigation from "../../components/MagazineNavigation/MagazineNavigation";
import { usePathname } from "next/navigation";

jest.mock("../../components/NavigationBar/NavigationLogo", () => ({ __esModule: true, default: () => <svg aria-hidden="true" /> }));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn(), prefetch: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));
jest.mock("../../components/NavigationBar/MegaMenu", () => ({ __esModule: true, default: ({ section }: { section: string }) => <div id="desktop-submenu"><a href="#world-menu">{section} menu</a></div> }));
beforeAll(() => {
  window.matchMedia = jest.fn().mockReturnValue({ addEventListener: jest.fn(), removeEventListener: jest.fn() });
  global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
});

test("desktop sections open by keyboard and Escape restores trigger focus", async () => {
  const user = userEvent.setup();
  render(<NavigationBar />);
  const trigger = screen.getByRole("button", { name: "Articles subsections" });
  trigger.focus();
  await user.keyboard("{Enter}");
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "United States" })).toBeInTheDocument();
  await user.keyboard("{Tab}");
  expect(screen.getByRole("link", { name: "United States" })).toHaveFocus();
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(trigger).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("link", { name: "Puzzles" })).toHaveAttribute("href", "/puzzles");
  screen.getByRole("button", { name: "Puzzles subsections" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("link", { name: "Weekly Crossword" })).toHaveAttribute("href", "/puzzles");
  expect(screen.getByRole("link", { name: "Puzzle Archive" })).toHaveAttribute("href", "/puzzles-archives");
  await user.keyboard("{Escape}");
  const search = screen.getByRole("button", { name: "Search" });
  await user.click(search);
  expect(screen.getByRole("searchbox")).toHaveFocus();
  expect(screen.getByRole("search")).toHaveAttribute("action", "/search");
  expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q");
  const form = screen.getByRole("search") as HTMLFormElement;
  const submission = jest.fn((event: Event) => event.preventDefault());
  form.addEventListener("submit", submission);
  await user.type(screen.getByRole("searchbox"), "climate & energy{Enter}");
  expect(submission).toHaveBeenCalledTimes(1);
  expect(new FormData(form).get("q")).toBe("climate & energy");
  expect(screen.getByRole("searchbox")).toBeEnabled();

  await user.keyboard("{Escape}");
  expect(search).toHaveFocus();
  expect(screen.queryByRole("search")).not.toBeInTheDocument();
  document.documentElement.dataset.theme = "dark";
  localStorage.setItem("bpr-theme", "dark");
  await user.click(screen.getByRole("button", { name: /Theme: Dark\. Switch to Light/ }));
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
  expect(localStorage.getItem("bpr-theme")).toBe("light");
  await user.click(screen.getByRole("button", { name: /Theme: Light\. Switch to Dark/ }));
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(localStorage.getItem("bpr-theme")).toBe("dark");
  const container = document.createElement("div");
  container.className = "page-container";
  container.innerHTML = '<div class="main-content"><section class="hero-section"></section></div>';
  document.body.appendChild(container);
  const hero = container.querySelector("section")!;
  const rect = jest.spyOn(hero, "getBoundingClientRect");
  rect.mockReturnValue({ bottom: 100 } as DOMRect);
  fireEvent.scroll(window);
  await waitFor(() => expect(screen.getByRole("navigation", { name: "Main navigation" })).not.toHaveClass("scrolled"));
  rect.mockReturnValue({ bottom: -1 } as DOMRect);
  fireEvent.scroll(window);
  await waitFor(() => expect(screen.getByRole("navigation", { name: "Main navigation" })).toHaveClass("scrolled"));
  rect.mockReturnValue({ bottom: 500 } as DOMRect);
  fireEvent.scroll(window);
  await waitFor(() => expect(screen.getByRole("navigation", { name: "Main navigation" })).not.toHaveClass("scrolled"));
  container.remove();

});

test("mobile menu restores scroll and focus, and hides closed subsection links", async () => {
  const user = userEvent.setup();
  document.body.style.overflow = "auto";
  const { unmount } = render(<NavigationBar />);
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  expect(document.body.style.overflow).toBe("hidden");
  const trigger = screen.getByRole("button", { name: "World subsections" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("link", { name: "Africa" })).not.toBeInTheDocument();
  await user.click(trigger);
  expect(screen.getByRole("link", { name: "Africa" })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  expect(document.body.style.overflow).toBe("auto");
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  unmount();
  expect(document.body.style.overflow).toBe("auto");
});

test("mobile focus wraps through visible links and controls", async () => {
  const user = userEvent.setup();
  render(<NavigationBar />);
  const toggle = screen.getByRole("button", { name: "Open menu" });
  await user.click(toggle);
  const logo = screen.getByRole("link", { name: "Brown Political Review home" });
  logo.focus();
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  const aboutToggle = screen.getAllByRole("button", { name: "About subsections" })[1];
  expect(aboutToggle).toHaveFocus();
  await user.keyboard("{Tab}");
  expect(logo).toHaveFocus();
});

test("feature height controls side counts and reflows on resize without dropping articles", async () => {
  const previousMedia = window.matchMedia;
  window.matchMedia = jest.fn().mockReturnValue({ matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() });
  let featureHeight = 400;
  const heights: Record<number, number> = { 1: 180, 2: 120, 4: 170, 5: 100, 6: 200, 7: 400, 8: 100, 9: 100 };
  const rectangle = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function(this: HTMLElement) {
    const id = Number(this.textContent?.match(/Story (\d+)/)?.[1]);
    const height = this.classList.contains("feature-height-source") ? featureHeight : heights[id] || 0;
    return { width: 300, height, top: 0, left: 0, bottom: height, right: 300, x: 0, y: 0, toJSON() {} };
  });
  const style = document.createElement("style");
  style.textContent = ".feature-side-column { row-gap: 13px; }";
  document.head.appendChild(style);
  const posts: EnhancedPost[] = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1, slug: `story-${index + 1}`, title: { rendered: `Story ${index + 1}` },
    excerpt: { rendered: "Summary", protected: false }, content: { rendered: "", protected: false },
    author_name: "Writer", date: "2026-01-01", date_gmt: "2026-01-01", modified: "2026-01-01", modified_gmt: "2026-01-01",
    guid: { rendered: "" }, status: "publish", type: "post", link: "", author: 0, featured_media: 0, format: "standard", categories: [], tags: [],
    featured_media_obj: { id: 1, date: "", slug: "", type: "attachment", link: "", title: { rendered: "" }, author: 0,
      caption: { rendered: "" }, alt_text: "Cover", media_type: "image", mime_type: "image/jpeg", source_url: "https://brownpoliticalreview.org/cover.jpg",
      media_details: { width: 800, height: 600, file: "", sizes: {} } },
  }));
  const view = render(<ArticlePreviewGrid articles={posts} />);
  try {
    const ids = (selector: string) => Array.from(view.container.querySelectorAll<HTMLElement>(selector)).map(element => element.dataset.fitId);
    expect(ids(".apg-left-column [data-fit-id]")).toEqual(["1", "5"]);
    expect(ids(".apg-right-column [data-fit-id]")).toEqual(["2", "4"]);
    expect(ids(".apg-overflow [data-fit-id]")).toEqual(["6", "7", "8", "9"]);
    expect(view.container.querySelector(".article-preview-grid")).toHaveStyle({ "--feature-height": "400px" });
    expect(view.container.querySelectorAll("[data-side-column] .feature-side-card--stacked")).toHaveLength(4);
    featureHeight = 1600;
    fireEvent.resize(window);
    await waitFor(() => expect(view.container.querySelector(".apg-overflow")).not.toBeInTheDocument());
    expect(new Set(ids("[data-fit-id]")).size).toBe(8);
    expect(view.container.querySelector(".article-preview-grid")).toHaveStyle({ "--feature-height": "1600px" });
    expect(view.container.querySelectorAll(".apg-left-column .feature-side-card--stacked")).toHaveLength(0);
    expect(view.container.querySelectorAll(".apg-right-column .feature-side-card--stacked")).toHaveLength(3);
  } finally {
    view.unmount();
    rectangle.mockRestore();
    window.matchMedia = previousMedia;
    style.remove();
  }
});

test("media cards show format placeholders and video thumbnails degrade to a labeled fallback", () => {
  const post = { id: 1, slug: "radio-episode", title: { rendered: "Radio episode" }, format: "standard",
    content: { rendered: "", protected: false }, excerpt: { rendered: "Summary", protected: false },
    author_name: "Writer", media_preview: { type: "audio" },
  } as EnhancedPost;
  const card = render(<ArticleCard article={post} />);
  expect(screen.getByRole("img", { name: "Audio preview unavailable" })).toBeInTheDocument();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/world/article/radio-episode");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  card.unmount();
  render(<ArticleMedia article={{ ...post, title: { rendered: "Video episode" }, media_preview: { type: "video", thumbnail: "https://i.ytimg.com/vi/RCC7PZfoUTs/hqdefault.jpg" } }} />);
  const thumbnail = screen.getByRole("img", { name: "Video episode" });
  expect(decodeURIComponent(thumbnail.getAttribute("src") || "")).toContain("https://i.ytimg.com/vi/RCC7PZfoUTs/hqdefault.jpg");
  fireEvent.error(thumbnail);
  expect(screen.getByRole("img", { name: "Video preview unavailable" })).toBeInTheDocument();
});

test("Magazine menu links to a single archive", async () => {
  const user = userEvent.setup();
  render(<NavigationBar />);
  screen.getByRole("button", { name: "Magazine subsections" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("link", { name: "Latest Issue" })).toHaveAttribute("href", "/magazine");
  expect(screen.getByRole("link", { name: "Archive" })).toHaveAttribute("href", "/magazine/issues");
  expect(screen.queryByRole("link", { name: "All Issues" })).not.toBeInTheDocument();
});

test("issue pages with custom colors cycle Issue Colors, Dark, and Light with icon-only controls", async () => {
  const user = userEvent.setup();
  jest.mocked(usePathname).mockReturnValue("/magazine");
  document.documentElement.dataset.theme = "issue";
  localStorage.setItem("bpr-theme", "issue");
  const edition = document.createElement("main");
  edition.className = "page-container issue-edition";
  document.body.appendChild(edition);
  const view = render(<NavigationBar />);
  try {
    await waitFor(() => expect(screen.getByRole("button", { name: /Theme: Issue Colors/ })).toBeInTheDocument());
    expect(screen.queryByText("Issue Colors")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Theme: Issue Colors\. Switch to Dark/ }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await user.click(screen.getByRole("button", { name: /Theme: Dark\. Switch to Light/ }));
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    await user.click(screen.getByRole("button", { name: /Theme: Light\. Switch to Issue Colors/ }));
    expect(document.documentElement).toHaveAttribute("data-theme", "issue");
    expect(localStorage.getItem("bpr-theme")).toBe("issue");
  } finally {
    view.unmount();
    edition.remove();
    jest.mocked(usePathname).mockReturnValue("/");
  }
});

test("magazine pages without custom colors keep Light/Dark only and hide the palette", async () => {
  const user = userEvent.setup();
  jest.mocked(usePathname).mockReturnValue("/magazine");
  document.documentElement.dataset.theme = "issue";
  localStorage.setItem("bpr-theme", "issue");
  const edition = document.createElement("main");
  edition.className = "page-container";
  document.body.appendChild(edition);
  const view = render(<NavigationBar />);
  try {
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", expect.stringMatching(/^(light|dark)$/)));
    expect(screen.queryByRole("button", { name: /Issue Colors/ })).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /Theme: (Light|Dark)\. Switch to (Light|Dark)/ });
    await user.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toMatch(/^(light|dark)$/);
    expect(localStorage.getItem("bpr-theme")).toMatch(/^(light|dark)$/);
  } finally {
    view.unmount();
    edition.remove();
    jest.mocked(usePathname).mockReturnValue("/");
  }
});

test("issue colors default first when available even if a light or dark preference is saved", async () => {
  jest.mocked(usePathname).mockReturnValue("/magazine/issues/spring-2026");
  localStorage.removeItem("bpr-theme");
  document.documentElement.dataset.theme = "light";
  const edition = document.createElement("main");
  edition.className = "page-container issue-edition";
  document.body.appendChild(edition);
  const view = render(<NavigationBar />);
  try {
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "issue"));
    expect(screen.getByRole("button", { name: /Theme: Issue Colors\. Switch to Dark/ })).toBeInTheDocument();
    view.unmount();
    localStorage.setItem("bpr-theme", "dark");
    document.documentElement.dataset.theme = "dark";
    const again = render(<NavigationBar />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "issue"));
    expect(screen.getByRole("button", { name: /Theme: Issue Colors\. Switch to Dark/ })).toBeInTheDocument();
    again.unmount();
  } finally {
    edition.remove();
    jest.mocked(usePathname).mockReturnValue("/");
  }
});

test("article feed reports loading, waits for retry after errors, and ends without an end message", async () => {
  const previousObserver = global.IntersectionObserver;
  const previousFetch = global.fetch;
  let notify: IntersectionObserverCallback = () => {};
  global.IntersectionObserver = jest.fn().mockImplementation((callback: IntersectionObserverCallback) => {
    notify = callback;
    return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
  });
  const fetchMore = jest.fn().mockRejectedValueOnce(new Error("Temporary failure"))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ posts: [], hasMore: false }) });
  global.fetch = fetchMore;
  const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
  const post: EnhancedPost = { id: 1, slug: "existing-story", title: { rendered: "Existing story" }, date: "2026-01-01",
    content: { rendered: "", protected: false }, excerpt: { rendered: "Summary", protected: false },
    author_name: "Writer", format: "standard", categories_obj: [], date_gmt: "2026-01-01",
    modified: "2026-01-01", modified_gmt: "2026-01-01", guid: { rendered: "" }, status: "publish",
    type: "post", link: "", author: 0, featured_media: 0, categories: [], tags: [], meta: {},
  };
  const user = userEvent.setup();
  const view = render(<InfiniteScrollArticleList subsection="world" initialPosts={[post]} />);
  try {
    const signal = () => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    act(signal);
    expect(screen.getByRole("status")).toHaveTextContent("Loading more articles");
    expect(await screen.findByRole("alert")).toHaveTextContent("Temporary failure");
    act(signal);
    expect(fetchMore).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(view.container.querySelector(".article-feed-trigger")).toHaveAttribute("hidden"));
    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/reached the end/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Existing story/ })).toBeInTheDocument();
  } finally {
    view.unmount();
    global.IntersectionObserver = previousObserver;
    global.fetch = previousFetch;
    errorLog.mockRestore();
  }
});

test("archive switches between two views with stable link order and active styling", () => {
  jest.mocked(usePathname).mockReturnValue("/magazine/issues");
  const view = render(<MagazineNavigation />);
  try {
    expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Issues", "Articles"]);
    expect(screen.getByRole("link", { name: "Issues" })).toHaveAttribute("aria-current", "page");
    const issuesLink = screen.getByRole("link", { name: "Issues" });
    jest.mocked(usePathname).mockReturnValue("/magazine/archive");
    view.rerender(<MagazineNavigation />);
    expect(screen.getByRole("link", { name: "Issues" })).toBe(issuesLink);
    expect(screen.getByRole("link", { name: "Issues" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  } finally {
    view.unmount();
    jest.mocked(usePathname).mockReturnValue("/");
  }
});

test("article archive deduplicates responses and prevents concurrent initial requests", async () => {
  const previousObserver = global.IntersectionObserver;
  const previousFetch = global.fetch;
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
  const post: EnhancedPost = { id: 1, slug: "archive-story", title: { rendered: "Archive story" }, date: "2020-11-09T00:30:00",
    date_gmt: "2020-11-09", modified: "2020-11-09", modified_gmt: "2020-11-09", guid: { rendered: "" },
    status: "publish", type: "post", link: "", author: 0, featured_media: 0, categories: [], tags: [], format: "standard",
    content: { rendered: "", protected: false }, excerpt: { rendered: "Summary", protected: false }, author_name: "Writer",
  };
  const fetchPage = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [post, post] }) });
  global.fetch = fetchPage;
  const view = render(<React.StrictMode><ArticleArchivePage /></React.StrictMode>);
  try {
    await screen.findByRole("link", { name: /Archive story/ });
    expect(screen.getAllByRole("link", { name: /Archive story/ })).toHaveLength(1);
    expect(fetchPage.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(fetchPage.mock.calls.length).toBeLessThanOrEqual(2);
    expect(screen.getByText("NOV 9, 2020")).toBeInTheDocument();
    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
  } finally {
    view.unmount();
    global.fetch = previousFetch;
    global.IntersectionObserver = previousObserver;
  }
});

test("About includes the local WordPress High School Program page on desktop and mobile", async () => {
  const user = userEvent.setup();
  render(<NavigationBar />);
  screen.getByRole("button", { name: "About subsections" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("link", { name: "High School Program" })).toHaveAttribute("href", "/about/high-school-program");
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  const about = screen.getAllByRole("button", { name: "About subsections" })[1];
  await user.click(about);
  expect(screen.getAllByRole("link", { name: "High School Program" }).some(link => link.getAttribute("href") === "/about/high-school-program")).toBe(true);
});
