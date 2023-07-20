import Link from "next/link";
import "./globals.css";
import { Lexend_Deca } from "next/font/google";
import NavBar from "./NavBar";

const lexendDeca = Lexend_Deca({ subsets: ["latin"] });

export const metadata = {
  title: "Game Board",
  description: "A website to play your beloved game boards against other people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={lexendDeca.className}>
        <header>
          <NavBar />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
