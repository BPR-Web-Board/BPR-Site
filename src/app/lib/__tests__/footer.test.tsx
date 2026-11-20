/** @jest-environment jsdom */
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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

test("newsletter stays visible over the footer and synchronizes dismissal across tabs", () => {
  render(<><Footer /><NewsletterSignup /></>);
  act(() => jest.advanceTimersByTime(5000));
  expect(screen.getByRole("complementary")).toBeInTheDocument();
  fireEvent(window, new StorageEvent("storage", { key: "bpr-newsletter-dismissed", newValue: "true" }));
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});
