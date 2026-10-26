// Production origin confirmed by the owner. Update this when the public domain changes.
export const site = {
  origin: "https://myportfolio-alpha-one-48.vercel.app",
  name: "Anirudh Shashikumar",
  title: "Anirudh Shashikumar — Engineering the Next Era of Intelligence",
  description:
    "I build systems across AI, vision, software, and the physical world. Portfolio of Anirudh Shashikumar — Computer Science Engineering.",
  image: "/opengraph-image.png",
  imageAlt:
    "Anirudh Shashikumar — Engineering the Next Era of Intelligence. AI, vision, software and physical systems.",
  profiles: [
    "https://github.com/AnirudhShashikumar",
    "https://www.linkedin.com/in/anirudh-shashikumar",
  ],
} as const;

export const homeUrl = `${site.origin}/`;
