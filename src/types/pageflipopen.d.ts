declare module "pageflipopen" {
  export type PageFlipOpenOptions = {
    source: string;
    startPage?: number;
    flipDuration?: number;
    autoLayout?: boolean;
    singlePageMode?: boolean;
    autoHeight?: boolean;
    enableZoom?: boolean;
    zoom?: number;
    zoomMin?: number;
    zoomMax?: number;
    backgroundColor?: string;
    pageBackground?: string;
    enableFullscreen?: boolean;
    enableDownload?: boolean;
    downloadFilename?: string | null;
    enableKeyboard?: boolean;
    enableTouch?: boolean;
    toolbar?: boolean;
    toolbarAlwaysVisible?: boolean;
    onReady?: () => void;
    onPageChange?: (pageNumber: number) => void;
    onError?: (error: Error) => void;
  };

  export class PageFlipOpen {
    constructor(container: HTMLElement, options: PageFlipOpenOptions);
    static setPdfWorkerSrc(src: string): void;
    flipTo(pageNumber: number): void;
    next(): void;
    prev(): void;
    first(): void;
    last(): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomReset(): void;
    toggleFullscreen(): void;
    destroy(): void;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly layout: "single" | "double";
    readonly isAnimating: boolean;
  }
}

declare module "pageflipopen/pageflipopen.css";
