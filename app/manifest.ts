import type { MetadataRoute } from "next";

/** Lets the trainer be added to a phone home screen and opened full screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Music Trainer",
    short_name: "Trainer",
    description: "Theory drilling for the 5-unit Bagrut track.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
