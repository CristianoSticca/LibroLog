import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { BooksProvider } from "@/context/BooksContext";
import BottomNav from "@/components/BottomNav";

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
    <html lang="it" className={`${newsreader.variable} ${manrope.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#fcf9f4] text-[#1c1c19]">
        <BooksProvider>
          {children}
          <BottomNav />
        </BooksProvider>
      </body>
    </html>
  );
}
