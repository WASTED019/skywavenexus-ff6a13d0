import assert from "node:assert/strict";
import { isPublishedMediaPath, isValidDavisImageBase64 } from "./davis-content";

const published = {
  hero_image: "/api/public/davis-media/hero.jpg",
  work: [{ image: "/api/public/davis-media/project.webp" }],
  gallery: [{ url: "/api/public/davis-media/dispatch.png" }],
};

assert.equal(isPublishedMediaPath(published, "hero.jpg"), true);
assert.equal(isPublishedMediaPath(published, "project.webp"), true);
assert.equal(isPublishedMediaPath(published, "dispatch.png"), true);
assert.equal(isPublishedMediaPath(published, "unpublished.jpg"), false);
assert.equal(isPublishedMediaPath(published, "../hero.jpg"), false);
assert.equal(isValidDavisImageBase64("iVBORw=="), true);
assert.equal(isValidDavisImageBase64(""), false);
assert.equal(isValidDavisImageBase64("%%%"), false);
assert.equal(isValidDavisImageBase64("A".repeat(13_981_020)), false);