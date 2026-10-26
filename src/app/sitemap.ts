import type { MetadataRoute } from "next";
import { homeUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: homeUrl }];
}
