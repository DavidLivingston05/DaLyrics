import { useEffect, useRef } from 'react';

type MutableRefObject<T> = { current: T };

export const useTextAutoFit = (
  textFitRef: MutableRefObject<HTMLElement | null>,
  fitScaleRef: MutableRefObject<number>,
  setFitVersion: (v: number | ((prev: number) => number)) => void,
  isLowerThird: boolean,
  text?: string
) => {
  const rafRef = useRef<number>(0);
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (isLowerThird) return;

    const el = textFitRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    if (text === prevTextRef.current) return;
    prevTextRef.current = text;

    fitScaleRef.current = 1;

    rafRef.current = requestAnimationFrame(() => {
      const hostRect = parent.getBoundingClientRect();
      const hostHeight = hostRect.height;
      if (!hostHeight || hostHeight <= 0) return;

      const cstyle = getComputedStyle(parent);
      const padV = (parseFloat(cstyle.paddingTop) || 0) + (parseFloat(cstyle.paddingBottom) || 0);
      const contentHeight = hostHeight - padV;
      if (contentHeight <= 0) return;

      const baseSize = parseFloat(el.dataset.baseFontSize || '10');
      el.style.fontSize = `${baseSize}rem`;
      const textHeight = el.scrollHeight;

      if (textHeight > contentHeight + 2) {
        const scale = Math.max(0.05, (contentHeight / textHeight) * 0.95);
        fitScaleRef.current = scale;
        el.style.fontSize = `${baseSize * scale}rem`;

        const newTextHeight = el.scrollHeight;
        if (newTextHeight > contentHeight + 2) {
          const scale2 = Math.max(0.05, scale * (contentHeight / newTextHeight) * 0.95);
          fitScaleRef.current = scale2;
          el.style.fontSize = `${baseSize * scale2}rem`;
        }
      }

      setFitVersion(v => v + 1);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, isLowerThird]);
};
