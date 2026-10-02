"use client";

import { useEffect } from "react";

// Keep semantic stories mounted. Decode only current/approaching project assets.
export default function WorkAssets() {
  useEffect(() => {
    const projects = document.querySelectorAll<HTMLElement>("[data-work-project]");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const project = entry.target;
        for (const image of project.querySelectorAll<HTMLImageElement>("img")) {
          image.loading = "eager";
          void image.decode().catch(() => { /* Loading/errors remain handled by the image element. */ });
        }
        observer.unobserve(project);
      }
    }, { rootMargin: "100% 0px" });
    projects.forEach((project) => observer.observe(project));
    return () => observer.disconnect();
  }, []);

  return null;
}
