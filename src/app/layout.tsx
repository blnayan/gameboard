import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Game Board",
  description: "A website to play your beloved game boards against other people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Link href="/">Home</Link>
        <Link href="/chess">Chess</Link>
        {children}
      </body>
    </html>
  );
}
