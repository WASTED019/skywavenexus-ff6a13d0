import photo0_0 from "@/assets/davis-optimized/photo-1-480.webp.asset.json";
import photo0_1 from "@/assets/davis-optimized/photo-1-960.webp.asset.json";
import photo0_2 from "@/assets/davis-optimized/photo-1-1280.webp.asset.json";
import photo1_0 from "@/assets/davis-optimized/photo-2-480.webp.asset.json";
import photo1_1 from "@/assets/davis-optimized/photo-2-960.webp.asset.json";
import photo1_2 from "@/assets/davis-optimized/photo-2-1600.webp.asset.json";
import photo2_0 from "@/assets/davis-optimized/photo-3-480.webp.asset.json";
import photo2_1 from "@/assets/davis-optimized/photo-3-960.webp.asset.json";
import photo2_2 from "@/assets/davis-optimized/photo-3-1600.webp.asset.json";
import photo3_0 from "@/assets/davis-optimized/photo-4-480.webp.asset.json";
import photo3_1 from "@/assets/davis-optimized/photo-4-960.webp.asset.json";
import photo3_2 from "@/assets/davis-optimized/photo-4-1600.webp.asset.json";
import photo4_0 from "@/assets/davis-optimized/photo-5-480.webp.asset.json";
import photo4_1 from "@/assets/davis-optimized/photo-5-960.webp.asset.json";
import photo4_2 from "@/assets/davis-optimized/photo-5-1600.webp.asset.json";
import photo5_0 from "@/assets/davis-optimized/photo-6-480.webp.asset.json";
import photo5_1 from "@/assets/davis-optimized/photo-6-960.webp.asset.json";
import photo5_2 from "@/assets/davis-optimized/photo-6-1400.webp.asset.json";
import photo6_0 from "@/assets/davis-optimized/photo-7-480.webp.asset.json";
import photo6_1 from "@/assets/davis-optimized/photo-7-960.webp.asset.json";
import photo6_2 from "@/assets/davis-optimized/photo-7-1400.webp.asset.json";
import photo7_0 from "@/assets/davis-optimized/photo-8-480.webp.asset.json";
import photo7_1 from "@/assets/davis-optimized/photo-8-960.webp.asset.json";
import photo7_2 from "@/assets/davis-optimized/photo-8-1400.webp.asset.json";

type OptimizedImage = { width: number; height: number; variants: { url: string; width: number }[] };
const images: Record<string, OptimizedImage> = {
  "/api/public/davis-media/1791631097524-h5tnp9.jpg": { width: 1280, height: 960, variants: [{ url: photo0_0.url, width: 480 }, { url: photo0_1.url, width: 960 }, { url: photo0_2.url, width: 1280 }] },
  "/api/public/davis-media/1791548456180-1wmxm6.jpg": { width: 3096, height: 4128, variants: [{ url: photo1_0.url, width: 480 }, { url: photo1_1.url, width: 960 }, { url: photo1_2.url, width: 1600 }] },
  "/api/public/davis-media/1788743245393-6jw21x.jpg": { width: 3120, height: 4160, variants: [{ url: photo2_0.url, width: 480 }, { url: photo2_1.url, width: 960 }, { url: photo2_2.url, width: 1600 }] },
  "/api/public/davis-media/1788743259783-y5vp39.jpg": { width: 3120, height: 4160, variants: [{ url: photo3_0.url, width: 480 }, { url: photo3_1.url, width: 960 }, { url: photo3_2.url, width: 1600 }] },
  "/api/public/davis-media/1788743274431-h1x0d1.jpg": { width: 6000, height: 4000, variants: [{ url: photo4_0.url, width: 480 }, { url: photo4_1.url, width: 960 }, { url: photo4_2.url, width: 1600 }] },
  "/api/public/davis-media/gallery-drone.jpg": { width: 1400, height: 1000, variants: [{ url: photo5_0.url, width: 480 }, { url: photo5_1.url, width: 960 }, { url: photo5_2.url, width: 1400 }] },
  "/api/public/davis-media/gallery-cycling.jpg": { width: 1400, height: 1000, variants: [{ url: photo6_0.url, width: 480 }, { url: photo6_1.url, width: 960 }, { url: photo6_2.url, width: 1400 }] },
  "/api/public/davis-media/gallery-foodsafety.jpg": { width: 1400, height: 1000, variants: [{ url: photo7_0.url, width: 480 }, { url: photo7_1.url, width: 960 }, { url: photo7_2.url, width: 1400 }] },
};

export function davisImageProps(src: string, sizes: string) {
  const image = images[src];
  if (!image) return { src };
  const fallback = image.variants[image.variants.length - 1];
  return {
    src: fallback?.url ?? src,
    srcSet: image.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", "),
    sizes,
    width: image.width,
    height: image.height,
  };
}
