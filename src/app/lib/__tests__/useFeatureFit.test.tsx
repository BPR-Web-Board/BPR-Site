/** @jest-environment jsdom */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import useFeatureFit from "../../components/shared/FeatureBalancedLayout/useFeatureFit";

const ids = [1, 2, 3, 4];

beforeAll(() => {
  window.matchMedia = jest.fn();
});

function Layout({ breakpoint, columns }: { breakpoint: number; columns: number }) {
  const { rootRef, layout } = useFeatureFit(ids, columns, breakpoint, ids);
  return (
    <div ref={rootRef}>
      <output data-testid="columns">{JSON.stringify(layout.columns)}</output>
      <output data-testid="overflow">{JSON.stringify(layout.overflow)}</output>
    </div>
  );
}

test.each([[768, 1], [1024, 2]])(
  "restores side cards after repeated narrow/wide transitions at %ipx",
  (breakpoint, columns) => {
    let matches = true;
    const listeners = new Set<() => void>();
    const matchMedia = jest.spyOn(window, "matchMedia").mockImplementation(() => ({
      get matches() { return matches; },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    } as unknown as MediaQueryList));
    global.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
    const frames: FrameRequestCallback[] = [];
    const requestFrame = jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    const resize = (wide: boolean) => {
      act(() => {
        matches = wide;
        listeners.forEach(listener => listener());
      });
      act(() => {
        frames.splice(0).forEach(callback => callback(0));
      });
    };
    const { unmount } = render(<Layout breakpoint={breakpoint} columns={columns} />);
    const original = screen.getByTestId("columns").textContent;
    for (let cycle = 0; cycle < 2; cycle++) {
      resize(false);
      expect(screen.getByTestId("columns").textContent).toBe(JSON.stringify(Array.from({ length: columns }, () => [])));
      expect(screen.getByTestId("overflow").textContent).toBe(JSON.stringify(ids));
      resize(true);
      expect(screen.getByTestId("columns").textContent).toBe(original);
      expect(screen.getByTestId("overflow").textContent).toBe("[]");
    }
    unmount();
    expect(listeners.size).toBe(0);
    requestFrame.mockRestore();
    matchMedia.mockRestore();
  }
);
