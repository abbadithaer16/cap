'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * A `fill` image that is only added once its box is within ~600px of the screen.
 * Keeps photos further down the page out of the first load (faster on mobile data).
 * The parent must be `position: relative` with a size (e.g. an aspect-ratio box).
 */
export function DeferredImage(props: ImageProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="absolute inset-0 block">
      {visible ? <Image {...props} fill /> : null}
    </span>
  );
}
