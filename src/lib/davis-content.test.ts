import { describe, expect, it } from "vitest";
import { isPublishedMediaPath } from "./davis-content";

const published = {
  hero_image: "/api/public/davis-media/hero.jpg",
  work: [{ image: "/api/public/davis-media/project.webp" }],
  gallery: [{ url: "/api/public/davis-media/dispatch.png" }],
};

describe("isPublishedMediaPath", () => {
  it("allows images referenced by published portfolio sections", () => {
    expect(isPublishedMediaPath(published, "hero.jpg")).toBe(true);
    expect(isPublishedMediaPath(published, "project.webp")).toBe(true);
    expect(isPublishedMediaPath(published, "dispatch.png")).toBe(true);
  });

  it("rejects unreferenced or unsafe image paths", () => {
    expect(isPublishedMediaPath(published, "unpublished.jpg")).toBe(false);
    expect(isPublishedMediaPath(published, "../hero.jpg")).toBe(false);
  });
});