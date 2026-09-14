type SectionLabelProps = {
  index: string;
  label: string;
  className?: string;
};

export default function SectionLabel({
  index,
  label,
  className = "",
}: SectionLabelProps) {
  return (
    <p className={`section-label text-xs tracking-widest text-[var(--muted)] ${className}`}>
      {index} / {label}
    </p>
  );
}
