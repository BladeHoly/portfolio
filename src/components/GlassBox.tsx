import { useGlass, type GlassOptions } from '@glass-midas/react';
import { useRef, type ReactNode } from 'react';

interface Props {
  as?: 'div' | 'article' | 'a' | 'li';
  className?: string;
  id?: string;
  href?: string;
  glass?: GlassOptions;
  children?: ReactNode;
}

/** Any block of the page as a glass surface. Without JS it renders as a plain tinted box. */
export default function GlassBox({ as: Tag = 'div', glass, children, ...props }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGlass(ref, { radius: 24, ...glass });
  const external = Tag === 'a' && props.href?.startsWith('http');
  return (
    <Tag
      // The tag varies, so the ref's element type does too.
      ref={ref as never}
      {...props}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Tag>
  );
}
