import type { Metadata } from "next";
import Link from "next/link";
import styles from "./NotFound.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page could not be found. Return to Anirudh Shashikumar's portfolio.",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.identity} aria-label="Anirudh Shashikumar — homepage">
        Anirudh<br />Shashikumar
      </Link>
      <section className={styles.message} aria-labelledby="not-found-title">
        <p className={styles.status}>404 / Page not found</p>
        <h1 id="not-found-title">A path<br />yet to exist.</h1>
        <p className={styles.explanation}>
          The page you&apos;re looking for isn&apos;t here. Return to the portfolio to explore the work.
        </p>
        <Link href="/" className={styles.home}>
          Back to portfolio <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <p className={styles.signature}>Engineering the Next Era of Intelligence</p>
    </main>
  );
}
