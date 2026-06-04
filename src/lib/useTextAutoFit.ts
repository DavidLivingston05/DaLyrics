import { useLayoutEffect, useRef } from 'react';

type MutableRefObject<T> = { current: T };

export const useTextAutoFit = (
  textFitRef: MutableRefObject<HTMLElement | null>,
  fitScaleRef: MutableRefObject<number>,
  setFitVersion: (v: number | ((prev: number) => number)) => void,
  isLowerThird: boolean,
  text?: string
) => {
  const rafRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (isLowerThird) return;

    const el = textFitRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    fitScaleRef.current = 1;

    const doFit = () => {
      const hostRect = parent.getBoundingClientRect();
      const hostHeight = hostRect.height;
      if (!hostHeight || hostHeight <= 0) return;

      const cstyle = getComputedStyle(parent);
      const padV = (parseFloat(cstyle.paddingTop) || 0) + (parseFloat(cstyle.paddingBottom) || 0);
      const contentHeight = hostHeight - padV;
      if (contentHeight <= 0) return;

      const baseSize = parseFloat(el.dataset.baseFontSize || '10');
      let scale = fitScaleRef.current;

      el.style.fontSize = `${baseSize * scale}rem`;
      const textHeight = el.scrollHeight;

      if (textHeight > contentHeight + 2 && scale > 0.05) {
        scale = Math.max(0.05, scale * (contentHeight / textHeight) * 0.95);
        fitScaleRef.current = scale;
        el.style.fontSize = `${baseSize * scale}rem`;

        const newTextHeight = el.scrollHeight;
        if (newTextHeight > contentHeight + 2 && scale > 0.05) {
          scale = Math.max(0.05, scale * (contentHeight / newTextHeight) * 0.95);
          fitScaleRef.current = scale;
          el.style.fontSize = `${baseSize * scale}rem`;
        }
      } else if (textHeight * 1.15 < contentHeight && scale < 1) {
        scale = 1;
        fitScaleRef.current = 1;
        el.style.fontSize = `${baseSize}rem`;
      }

      setFitVersion(v => v + 1);
    };

    rafRef.current = requestAnimationFrame(() => {
      doFit();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, isLowerThird]);
};
