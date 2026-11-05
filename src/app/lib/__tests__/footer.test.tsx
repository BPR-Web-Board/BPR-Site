/** @jest-environment jsdom */
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { existsSync } from "fs";
import { join } from "path";
import Footer from "../../components/Footer/Footer";
import NewsletterSignup from "../../components/NewsletterSignup/NewsletterSignup";

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("footer contains local pages, Donate, Instagram, Spotify, and email in one navigation", () => {
  render(<Footer />);
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(9);
  expect(screen.getByRole("link", { name: "Newsletter" })).toHaveAttribute("href", "http://eepurl.com/hJoTFX");
  expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/company/brown-political-review/posts/?feedView=all");
  expect(screen.getByRole("link", { name: "Donate" })).toHaveAttribute("href", "/donate");
  expect(screen.getByRole("link", { name: "Spotify" })).toHaveAttribute("href", "https://open.spotify.com/show/4OewXk59kprBDrq1to11Ap");
  expect(screen.getByRole("navigation", { name: "Footer" })).toContainElement(screen.getByRole("link", { name: "Instagram" }));
  expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "https://www.instagram.com/brownpoliticalreview/?hl=en#");
  expect(screen.getByRole("link", { name: "Email BPR" })).toHaveAttribute("href", "mailto:brown-political-review@brown.edu");
  for (const name of ["Instagram", "Spotify", "LinkedIn", "Email BPR"]) {
    expect(screen.getByRole("link", { name })).toHaveTextContent("");
  }
  for (const link of links) {
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const href = link.getAttribute("href")!;
    if (!href.startsWith("/")) continue;
    expect(existsSync(join(process.cwd(), "src/app", href, "page.tsx"))).toBe(true);
  }
});

test("newsletter appears after a delay without stealing focus or blocking page interaction", () => {
  render(<><button>Page control</button><NewsletterSignup /></>);
  const control = screen.getByRole("button", { name: "Page control" });
  control.focus();
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(4999));
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.getByRole("complementary", { name: "Stay in the loop" })).toBeInTheDocument();
  expect(control).toHaveFocus();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "http://eepurl.com/hJoTFX");
  fireEvent.click(control);
  expect(control).toBeEnabled();
});

for (const action of ["dismiss", "signup"]) {
  test(`newsletter stays hidden after ${action} and a fresh mount`, () => {
    const first = render(<NewsletterSignup />);
    act(() => jest.advanceTimersByTime(5000));
    fireEvent.click(action === "dismiss"
      ? screen.getByRole("button", { name: "Dismiss newsletter signup" })
      : screen.getByRole("link", { name: "Sign up" }));
    expect(localStorage.getItem("bpr-newsletter-dismissed")).toBe("true");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    first.unmount();
    render(<NewsletterSignup />);
    act(() => jest.advanceTimersByTime(10000));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });
}

test("newsletter remains dismissible if browser storage is unavailable", () => {
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
  render(<NewsletterSignup />);
  act(() => jest.advanceTimersByTime(5000));
  fireEvent.click(screen.getByRole("button", { name: "Dismiss newsletter signup" }));
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});

test("newsletter yields to the footer and synchronizes dismissal across tabs", () => {
  const previousObserver = global.IntersectionObserver;
  let notify: IntersectionObserverCallback = () => {};
  global.IntersectionObserver = jest.fn().mockImplementation((callback: IntersectionObserverCallback) => {
    notify = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
  try {
    render(<><Footer /><NewsletterSignup /></>);
    act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    act(() => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    act(() => notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    fireEvent(window, new StorageEvent("storage", { key: "bpr-newsletter-dismissed", newValue: "true" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  } finally {
    global.IntersectionObserver = previousObserver;
  }
});
