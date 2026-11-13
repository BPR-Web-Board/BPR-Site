import AboutPage, { generateStaticParams as aboutParams, generateMetadata as aboutMetadata } from "../../about/[page]/page";
import ContentPage, { generateStaticParams as contentParams, generateMetadata as contentMetadata } from "../../[contentPage]/page";

jest.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));

test("public pages are generated on demand rather than during builds", () => {
  expect(aboutParams()).toEqual([]);
  expect(contentParams()).toEqual([]);
});

test.each([
  ["story", "about", undefined, "About BPR"],
  ["masthead", "masthead", undefined, "Masthead"],
  ["eboard", "masthead", "Executive Board", "Executive Board"],
  ["join", "join", undefined, "Join BPR"],
  ["pitch", "write-for-bpr", undefined, "Pitch an Article"],
  ["high-school-program", "high-school-program", undefined, "High School Program"],
])("/about/%s keeps its content and metadata", async (page, slug, section, title) => {
  const props = { params: Promise.resolve({ page }) };
  expect((await AboutPage(props)).props).toEqual({ slug, section });
  expect(await aboutMetadata(props)).toEqual({ title: `${title} | Brown Political Review` });
});

test.each(["donate", "puzzles", "puzzles-archives"])("/%s keeps its content", async (contentPage) => {
  const props = { params: Promise.resolve({ contentPage }) };
  expect((await ContentPage(props)).props).toEqual({ slug: contentPage });
  expect((await contentMetadata(props)).title).toContain("Brown Political Review");
});

test.each(["missing", "constructor", "__proto__"])("unknown routes are rejected: %s", async (key) => {
  await expect(AboutPage({ params: Promise.resolve({ page: key }) })).rejects.toThrow("NOT_FOUND");
  await expect(ContentPage({ params: Promise.resolve({ contentPage: key }) })).rejects.toThrow("NOT_FOUND");
});
