interface Props {
  opacity?: number;
}

export default function DimOverlay({ opacity = 0 }: Props) {
  if (!opacity || opacity <= 0) return null;
  return (
    <div
      className="absolute inset-0 z-[1] pointer-events-none select-none"
      style={{ backgroundColor: `rgba(0, 0, 0, ${Math.min(opacity, 0.9)})` }}
    />
  );
}
