import type { Metadata } from "next";
import { Playfair_Display, Libre_Franklin } from "next/font/google";
import "./globals.css";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import Script from "next/script";

// Load Google Fonts as fallbacks for Adobe Fonts
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
  description: "The Brown Political Review is a nonpartisan political publication that seeks to promote ideological diversity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${libreFranklin.variable}`}>
      <head>
        {/* Load Adobe Fonts */}
        <link rel="stylesheet" href="https://use.typekit.net/oxs2lss.css" />
      </head>
      <body className="antialiased font-sans">
        <NavigationBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
