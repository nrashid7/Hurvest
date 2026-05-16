import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance text-4xl font-bold tracking-normal text-foreground sm:text-5xl">{title}</h2>
      {children ? <div className="mt-4 text-lg leading-8 text-muted-foreground">{children}</div> : null}
    </div>
  );
}

