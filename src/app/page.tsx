import type { Metadata } from "next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import ScrollDiscovery from "@/components/system/ScrollDiscovery";
import Hero from "@/sections/Hero";
import About from "@/sections/about/About";
import Contact from "@/sections/contact/Contact";
import Work from "@/sections/work/Work";
import { homeUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: homeUrl },
  openGraph: {
    type: "website",
    url: homeUrl,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: site.image, width: 1200, height: 630, type: "image/png", alt: site.imageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: site.image, alt: site.imageAlt }],
  },
};

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${homeUrl}#person`,
  name: site.name,
  url: homeUrl,
  description: "I build systems across AI, vision, software, and the physical world.",
  sameAs: site.profiles,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <main id="main-content">
        <Hero />

        <Work />

        <About />
        <Contact />
      </main>
      <ScrollDiscovery />
      <SiteFooter />
    </>
  );
}
