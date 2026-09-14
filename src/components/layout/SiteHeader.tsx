import Container from "@/components/ui/Container";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Lab", href: "#lab" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export default function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[var(--surface)] focus:px-4 focus:py-3 focus:not-sr-only"
      >
        Skip to content
      </a>
      <header data-site-header className="site-header fixed inset-x-0 top-0 z-40 border-b border-white/10">
        <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-4">
          <a href="#home" className="text-xs font-semibold tracking-widest">
            ANIRUDH SHASHIKUMAR
          </a>
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm sm:gap-x-6">
              {navigation.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="site-nav-link">{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </header>
    </>
  );
}
