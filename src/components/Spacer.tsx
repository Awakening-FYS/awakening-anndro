// src/components/Spacer.tsx
export default function Spacer({ size = "8" }: { size?: string }) {
  return <div className={`not-prose h-${size}`} />;
}
