import Container from "@/components/ui/Container";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-10">
      <Container>
        <p>Anirudh Shashikumar</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Engineering the Next Era of Intelligence.
        </p>
        <small className="mt-6 block text-[var(--muted)]">
          © {new Date().getFullYear()} Anirudh Shashikumar
        </small>
      </Container>
    </footer>
  );
}
