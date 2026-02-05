'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { shareLink } from '@/lib/share';

export function ShareButton(props: {
  url: string;
  title?: string;
  text?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const label = props.label ?? 'Share';

  return (
    <Button
      variant={props.variant ?? 'outline'}
      size={props.size ?? 'sm'}
      className={props.className}
      isLoading={busy}
      onClick={async () => {
        try {
          setBusy(true);
          await shareLink({ url: props.url, title: props.title, text: props.text });
        } finally {
          setBusy(false);
        }
      }}
    >
      {label}
    </Button>
  );
}

