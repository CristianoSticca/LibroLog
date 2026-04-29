import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { BooksProvider } from "@/context/BooksContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReadingSessionsProvider } from "@/context/ReadingSessionsContext";
import { BookPhotosProvider } from "@/context/BookPhotosContext";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const newsreader = Newsreader({
  variable: "--font-headline",
  subsets: ["latin"],
  axes: ["opsz"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LibroLog",
  description: "Il tuo diario di lettura personale",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${newsreader.variable} ${manrope.variable} h-full`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LibroLog" />
        <meta name="theme-color" content="#162b1d" />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <BooksProvider>
            <ReadingSessionsProvider>
              <BookPhotosProvider>
                {children}
                <BottomNavWrapper />
              </BookPhotosProvider>
            </ReadingSessionsProvider>
          </BooksProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

function BottomNavWrapper() {
  return <BottomNav />;
}
