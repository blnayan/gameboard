import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.navBar}>
        <div className={styles.linksContainer}>
          <Link className={styles.link} href="/">
            Home
          </Link>
          {/* <div className={`${styles.linkBox} ${router.pathname === "/chess" ? styles.active : ""}`}> */}
          <Link className={styles.link} href="/chess">
            Chess
          </Link>
          {/* </div> */}
        </div>
      </div>
    </header>
  );
}
