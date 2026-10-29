// Official UN SDG icon. Show it unaltered (no recolouring, cropping or rotating) per the UN SDG logo guidelines.
export default function SdgTile({ src, number, className }: { src: string; number: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`SDG ${number}`} className={className} draggable={false} />
  );
}
