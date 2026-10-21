import type { MetadataRoute } from "next";

// Описує сайт як застосунок: назва, іконки, кольори, повноекранний режим.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Шкільна дошка",
    short_name: "Дошка",
    description: "Місце для історій, фото та думок нашої школи",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0F0C",
    theme_color: "#0A0F0C",
    lang: "uk",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
