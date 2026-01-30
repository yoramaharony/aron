import { ARON_LOGO_ALT, ARON_LOGO_SRC, ARON_MARK_SRC } from '@/lib/branding';

export function AronLogo({
  className,
  imgClassName,
  variant,
}: {
  className?: string;
  imgClassName?: string;
  variant?: 'full' | 'mark';
}) {
  const src = variant === 'mark' ? ARON_MARK_SRC : ARON_LOGO_SRC;
  return (
    <div className={className}>
      <img
        src={src}
        alt={ARON_LOGO_ALT}
        className={imgClassName ?? 'aron-logo aron-logo-animated-soft h-8 w-auto object-contain'}
      />
    </div>
  );
}

