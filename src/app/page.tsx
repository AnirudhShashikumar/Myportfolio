import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import SectionBoundary from "@/components/graphics/SectionBoundary";
import SectionField from "@/components/graphics/SectionField";
import ScrollReveal from "@/components/system/ScrollReveal";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Hero from "@/sections/Hero";
import Work from "@/sections/work/Work";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero />

        <Work />

        <SectionBoundary tone="work-lab" />

        <section id="lab" aria-labelledby="lab-heading" className="visual-section py-20 sm:py-28" data-visual-tone="lab">
          <SectionField tone="lab" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel index="02" label="LAB" />
              <h2 id="lab-heading" className="mt-4 text-2xl">
                Lab
              </h2>
              <p className="mt-3 text-[var(--muted)]">Experiments coming soon.</p>
            </ScrollReveal>
          </Container>
        </section>

        <SectionBoundary tone="lab-about" />

        <section id="about" aria-labelledby="about-heading" className="visual-section py-20 sm:py-28" data-visual-tone="about">
          <SectionField tone="about" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel index="03" label="ABOUT" />
              <h2 id="about-heading" className="mt-4 text-2xl">
                About
              </h2>
              <p className="mt-3 text-[var(--muted)]">More about me coming soon.</p>
            </ScrollReveal>
          </Container>
        </section>

        <SectionBoundary tone="about-contact" />

        <section id="contact" aria-labelledby="contact-heading" className="visual-section py-20 sm:py-28" data-visual-tone="contact">
          <SectionField tone="contact" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel index="04" label="CONTACT" />
              <h2 id="contact-heading" className="mt-4 text-2xl">
                Contact
              </h2>
              <p className="mt-3 text-[var(--muted)]">Contact details coming soon.</p>
            </ScrollReveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
