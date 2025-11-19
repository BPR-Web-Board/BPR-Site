import type { Metadata } from "next";
import "./globals.css";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";

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
    <html lang="en">
      <body className="antialiased font-sans">
        <NavigationBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
