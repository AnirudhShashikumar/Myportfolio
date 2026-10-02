import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
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

        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
