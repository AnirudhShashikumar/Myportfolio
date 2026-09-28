import Container from "@/components/ui/Container";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p>ANIRUDH SHASHIKUMAR</p>
        <p>© 2026</p>
        <p>BUILT + ITERATED WITH INTENTION</p>
        <a href="#home">BACK TO TOP <span aria-hidden="true">↑</span></a>
      </Container>
    </footer>
  );
}
