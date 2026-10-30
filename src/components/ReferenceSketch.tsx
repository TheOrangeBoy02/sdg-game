import Image from "next/image";
import type { ThemeId } from "@/lib/content";

// Reference photo for each drawing challenge (files in public/brand/sketchImage/).
// Fills its parent, which must be positioned and sized.

const images: Record<ThemeId, string> = {
  climate: "/brand/sketchImage/earth.jpg",
  forests: "/brand/sketchImage/tree.png",
  water: "/brand/sketchImage/water_drop.jpg",
  education: "/brand/sketchImage/book.png",
  energy: "/brand/sketchImage/sun.png",
  communities: "/brand/sketchImage/house.jpg",
};

export default function ReferenceSketch({
  theme,
  sizes,
}: {
  theme: ThemeId;
  sizes: string;
}) {
  return (
    <Image
      src={images[theme]}
      alt=""
      fill
      sizes={sizes}
      priority
      draggable={false}
      className="pointer-events-none object-cover"
    />
  );
}
