import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  index?: string;
};

export function MemberPortalHeader({
  kicker,
  title,
  description,
  actions,
  index = "G",
}: Props) {
  return (
    <header className="relative overflow-hidden bg-primary-deep px-6 py-9 text-white sm:px-10 sm:py-11">
      <div
        aria-hidden
        className="absolute -right-8 -top-20 font-serif text-[15rem] leading-none text-white/[.035]"
      >
        {index}
      </div>
      <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end lg:pr-36">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-[.68rem] font-semibold uppercase tracking-[.24em] text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden />
            {kicker}
          </p>
          <h1 className="mt-5 font-serif text-4xl font-normal tracking-[-.035em] sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="relative flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
