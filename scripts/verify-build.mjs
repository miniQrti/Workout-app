import { readFile } from "node:fs/promises";

const manifest = JSON.parse(
  await readFile(new URL("../dist/manifest.webmanifest", import.meta.url), "utf8")
);

if (manifest.name !== "Ironlog — Workout Tracker" || manifest.short_name !== "Ironlog") {
  throw new Error(`Unexpected PWA manifest identity: ${manifest.name} / ${manifest.short_name}`);
}

console.log("Verified Ironlog PWA manifest.");
