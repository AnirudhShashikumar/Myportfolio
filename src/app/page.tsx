import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import SectionBoundary from "@/components/graphics/SectionBoundary";
import SectionField from "@/components/graphics/SectionField";
import ScrollReveal from "@/components/system/ScrollReveal";
import Container from "@/components/ui/Container";
import SectionLabel from "@/components/ui/SectionLabel";
import Hero from "@/sections/Hero";
import About from "@/sections/about/About";
import Contact from "@/sections/contact/Contact";
import Work from "@/sections/work/Work";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero />

        <Work />

        <SectionBoundary tone="work-lab" />

        <section id="lab" aria-labelledby="lab-heading" className="visual-section flex min-h-[82svh] items-center py-20 sm:py-28" data-visual-tone="lab">
          <SectionField tone="lab" />
          <Container className="relative z-10">
            <ScrollReveal>
              <SectionLabel index="02" label="LAB" />
              <p className="mt-12 font-mono text-[0.65rem] tracking-[0.16em] text-[#708798]">
                CURRENT EXPLORATION / ONGOING
              </p>
              <h2 id="lab-heading" className="mt-4 max-w-5xl text-[clamp(3rem,8vw,8rem)] leading-[0.84] font-medium tracking-[-0.07em]">
                APPLIED AI.<br />USEFUL SYSTEMS.
              </h2>
              <div className="mt-12 grid gap-8 border-t border-[#a9d6ff1f] pt-5 font-mono text-[0.65rem] tracking-[0.1em] text-[#7f95a3] sm:grid-cols-[1fr_1.5fr]">
                <p>LAB / CURIOSITY IN PROGRESS</p>
                <p className="max-w-2xl leading-7">
                  Exploring how multimodal AI, computer vision, model integration and intelligent interfaces move beyond isolated demos into tools that can be used and tested.
                </p>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        <SectionBoundary tone="lab-about" />

        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
