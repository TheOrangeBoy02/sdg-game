import type { ThemeId } from "@/lib/content";

// Simple line-art reference images for each drawing challenge.
// Replace with illustrated assets later if desired (keep them simple and sketchable).

const paths: Record<ThemeId, React.ReactNode> = {
  climate: (
    <>
      <circle cx="100" cy="100" r="72" />
      <path d="M52 66c14 4 18 16 32 14s14 18 4 26-6 22 6 30M118 34c-4 12 6 18 18 18s18 14 30 10M120 128c10-6 24-4 30 8s-4 26-16 30" />
      <path d="M30 100h140M100 28c-22 20-22 124 0 144M100 28c22 20 22 124 0 144" opacity=".35" />
    </>
  ),
  forests: (
    <>
      <path d="M100 26c-26 0-44 18-42 40-18 6-26 24-18 40 8 16 28 22 44 16 6 6 12 8 16 8s10-2 16-8c16 6 36 0 44-16 8-16 0-34-18-40 2-22-16-40-42-40z" />
      <path d="M100 130v46M100 150l-18-14M100 142l16-14M76 176h48" />
    </>
  ),
  water: (
    <>
      <path d="M100 24c-30 42-56 74-56 104a56 56 0 0 0 112 0c0-30-26-62-56-104z" />
      <path d="M72 128c0 18 12 30 28 32" />
    </>
  ),
  education: (
    <>
      <path d="M100 52c-22-14-50-16-74-10v118c24-6 52-4 74 10 22-14 50-16 74-10V42c-24-6-52-4-74 10z" />
      <path d="M100 52v118" />
      <path d="M44 72c14-2 28 0 40 6M44 96c14-2 28 0 40 6M116 78c12-6 26-8 40-6M116 102c12-6 26-8 40-6" opacity=".45" />
    </>
  ),
  energy: (
    <>
      <circle cx="100" cy="100" r="36" />
      <path d="M100 20v24M100 156v24M20 100h24M156 100h24M43 43l17 17M140 140l17 17M43 157l17-17M140 60l17-17" />
    </>
  ),
  communities: (
    <>
      <path d="M34 92l66-58 66 58" />
      <path d="M50 80v92h100V80" />
      <path d="M86 172v-46h28v46" />
      <path d="M62 100h20v20H62zM118 100h20v20h-20zM132 52V34h16v32" />
    </>
  ),
};

export default function ReferenceSketch({
  theme,
  className,
}: {
  theme: ThemeId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[theme]}
    </svg>
  );
}
