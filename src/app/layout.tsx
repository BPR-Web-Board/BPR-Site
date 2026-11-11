import type { Metadata } from "next";
import { Playfair_Display, Libre_Franklin } from "next/font/google";
import "./globals.css";
import "./not-found.css";
import NavigationBar from "./components/NavigationBar";
import NavigationProgress from "./components/NavigationProgress/NavigationProgress";
import Footer from "./components/Footer";
import NewsletterSignup from "./components/NewsletterSignup/NewsletterSignup";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-libre-franklin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brown Political Review",
  description:
    "Brown Political Review is Brown's entirely student-run political publication. Across our ten boards, undergraduates explore the most pressing political issues of our day.",
  openGraph: {
    title: "Brown Political Review",
    description:
      "Brown Political Review is Brown's entirely student-run political publication. Across our ten boards, undergraduates explore the most pressing political issues of our day.",
    siteName: "Brown Political Review",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${libreFranklin.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var theme;try{theme=localStorage.getItem('bpr-theme')}catch(e){}var issuePage=/^\\/magazine\\/?$/.test(location.pathname)||/^\\/magazine\\/issues\\/[^/]+\\/?$/.test(location.pathname);if(theme==='issue'&&!issuePage)theme=null;if(issuePage)document.documentElement.dataset.theme='issue';else if(theme==='light'||theme==='dark')document.documentElement.dataset.theme=theme;else document.documentElement.dataset.theme='dark'})()` }} />
        {/* Load Adobe Fonts */}
        <link rel="stylesheet" href="https://use.typekit.net/oxs2lss.css" />
      </head>
      <body className="antialiased font-sans">
        <NavigationProgress />
        <NavigationBar />
        {children}
        <Footer />
        <NewsletterSignup />
      </body>
    </html>
  );
}
