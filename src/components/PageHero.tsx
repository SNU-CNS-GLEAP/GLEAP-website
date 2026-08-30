type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  titleLang?: string;
  descriptionLang?: string;
  children?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  titleLang,
  descriptionLang,
  children,
}: Props) {
  return (
    <header className="page-hero">
      <div className="page-hero-inner">
        <h1 className="page-display" lang={titleLang}>{title}</h1>
        <p className="page-kicker">{eyebrow}</p>
        {description && <p className="page-lede" lang={descriptionLang}>{description}</p>}
        {children && <div className="page-hero-meta">{children}</div>}
      </div>
    </header>
  );
}
