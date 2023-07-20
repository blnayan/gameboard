"use client";

import Link from "next/link";
import styles from "./NavBar.module.css";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link className={`${styles.link} ${pathname === "/" ? styles.active : ""}`} href="/">
        Home
      </Link>
      <Link className={`${styles.link} ${pathname === "/chess/" ? styles.active : ""}`} href="/chess">
        Chess
      </Link>
    </nav>
  );
}
