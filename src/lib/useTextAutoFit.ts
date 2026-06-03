import { useLayoutEffect, useRef } from 'react';

type Dispatch<T> = (value: T) => void;
type MutableRefObject<T> = { current: T };
type SetStateAction<S> = S | ((prevState: S) => S);


export const useTextAutoFit = (
  textFitRef: MutableRefObject<HTMLElement | null>,
  fitScaleRef: MutableRefObject<number>,
  setFitVersion: Dispatch<SetStateAction<number>>,
  isLowerThird: boolean,
  text?: string
) => {
  const guardRef = useRef(0);

  useLayoutEffect(() => {
    const el = textFitRef.current;
    if (!el || isLowerThird) return;

    // Measure the *actual* available height instead of bailing out when parent.clientHeight === 0.
    // In flex layouts, the parent height may transiently be 0 during first layout.
    const parent = el.parentElement;
    const host = parent || el;

    const hostRect = host.getBoundingClientRect();
    const hostHeight = hostRect.height;
    if (!hostHeight || hostHeight <= 0) return;

    const cstyle = getComputedStyle(host);
    const padV = (parseFloat(cstyle.paddingTop) || 0) + (parseFloat(cstyle.paddingBottom) || 0);
    const contentHeight = hostHeight - padV;
    if (contentHeight <= 0) return;

    // scrollHeight is affected by current font-size; we adjust incrementally.
    const textHeight = el.scrollHeight;


    const baseSize = parseFloat(el.dataset.baseFontSize || '1.4');
    let changed = false;

    if (textHeight > contentHeight + 2 && fitScaleRef.current > 0.05) {
      const ratio = Math.max(0.05, (contentHeight / textHeight) * 0.95);
      if (ratio < 0.995) {
        fitScaleRef.current *= ratio;
        changed = true;
      }
    } else if (textHeight * 1.15 < contentHeight && fitScaleRef.current < 1) {
      fitScaleRef.current = 1;
      changed = true;
    }

    if (changed) {
      if (guardRef.current >= 15) { guardRef.current = 0; return; }
      guardRef.current++;
      el.style.fontSize = `${baseSize * fitScaleRef.current}rem`;
      setFitVersion(v => v + 1);
    } else {
      guardRef.current = 0;
    }
  }, [text, isLowerThird]);
};
