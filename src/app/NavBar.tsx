"use client";

import Link from "next/link";
import styles from "./NavBar.module.css";
import { usePathname } from "next/navigation";
import { getBasePath } from "@/scripts";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link className={`${styles.link} ${pathname === `${getBasePath()}/` ? styles.active : ""}`} href="/">
        Home
      </Link>
      <Link className={`${styles.link} ${pathname === `${getBasePath()}/chess/` ? styles.active : ""}`} href="/chess">
        Chess
      </Link>
    </nav>
  );
}
