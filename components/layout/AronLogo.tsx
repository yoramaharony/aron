import { ARON_LOGO_ALT, ARON_LOGO_SRC } from '@/lib/branding';

export function AronLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={className}>
      <img
        src={ARON_LOGO_SRC}
        alt={ARON_LOGO_ALT}
        className={imgClassName ?? 'aron-logo aron-logo-animated-soft h-8 w-auto object-contain'}
      />
    </div>
  );
}

