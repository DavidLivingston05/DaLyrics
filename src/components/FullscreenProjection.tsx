import React from 'react';
import { useState, useRef, useEffect } from 'react';


import { motion, AnimatePresence } from 'motion/react';
import { useTextAutoFit } from '../lib/useTextAutoFit';
import BackgroundRenderer from './Output/BackgroundRenderer';
import DimOverlay from './Output/DimOverlay';

export default function FullscreenProjection() {
  const textFitRef = useRef<HTMLParagraphElement>(null);
  const fitScaleRef = useRef(1);
  const [fitVersion, setFitVersion] = useState(0);
  const [packet, setPacket] = useState(() => {
    const saved = localStorage.getItem('lyrics_last_projection_packet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { text: '', isBlackout: false, isTextCleared: false, isLowerThird: false, copyright: '', styleSettings: null, liveCaptionText: '', activeBackground: null, activeMedia: null };
  });

  const {
    text, isBlackout, isTextCleared, isLowerThird, activeMode = 'SONGS',
    copyright, styleSettings, liveCaptionText, activeBackground, activeMedia,
    bibleVerseFontSize = 56, bibleVerseFontColor = '#ffffff',
    bibleVerseBgColor = '#000000', bibleVerseBgOpacity = 40,
    bibleHeadingFontSize = 36, bibleHeadingFontColor = '#d4d4d8',
    bibleHeadingBgColor = '#000000', bibleHeadingBgOpacity = 40,
  } = packet;
  const ss = styleSettings || {};

  // 1. Chords Stripping: Strip bracketed musician chords from the text for clean stage display
  // Robust pattern matches common chords like [C], [G/B], [C#m7/E], [Gsus4] while leaving non-chord bracketed notes intact
  const cleanText = text
    ? text.replace(/\[[A-G][b#]?(?:[^\s\]]*)\]/g, '').replace(/[^\S\r\n]+/g, ' ').trim()
    : '';

  // Reset auto-fit baseline when the visible content changes.
  // This prevents “carrying over” font scale from the previous slide.
  const isLowerThirdEffective = isLowerThird || ss.lowerThirdMode === 'lyrics';

  useEffect(() => {
    fitScaleRef.current = 1;

    setFitVersion(v => v + 1);
  }, [cleanText, isLowerThirdEffective, isBlackout, isTextCleared, activeMode, styleSettings]);



  useTextAutoFit(textFitRef, fitScaleRef, setFitVersion, isLowerThirdEffective, cleanText);



  // IMPORTANT: Keep the projection in sync with the studio using BroadcastChannel
  // AND a localStorage change fallback. The storage event is more reliable across
  // Electron BrowserWindows, while BroadcastChannel is faster in-browser.
  useEffect(() => {
    const bc = new BroadcastChannel('lyrics_projection_channel');
    bc.onmessage = (msgEvent) => {
      if (msgEvent?.data) setPacket(msgEvent.data);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lyrics_last_projection_packet' && e.newValue) {
        try { setPacket(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);

    return () => { bc.close(); window.removeEventListener('storage', onStorage); };
  }, []);

  // Final fallback: poll localStorage every 600ms in case BroadcastChannel + storage events
  // are unreliable (Electron has known issues with cross-window BroadcastChannel)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('lyrics_last_projection_packet');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPacket(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch {}
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & close controls directly on the TV Screen.
  // This allows operators to navigate slides (using clicker or keyboard arrows)
  // or close the TV Screen window via Escape when focused.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key -> instantly close the projection window
      if (e.key === 'Escape') {
        window.close();
        e.preventDefault();
        return;
      }

      // Next / Prev slide commands mapped to remote channel
      const remoteChannel = new BroadcastChannel('lyrics_remote_channel');

      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) {
        remoteChannel.postMessage({ type: 'NEXT_SLIDE' });
        e.preventDefault();
      } else if (['ArrowLeft', 'ArrowUp', 'Backspace', 'PageUp'].includes(e.key)) {
        remoteChannel.postMessage({ type: 'PREV_SLIDE' });
        e.preventDefault();
      }

      remoteChannel.close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDoubleClick = () => {
    // Double click -> close the projection window easily
    window.close();
  };

  function hexToRgb(hex: string): string {
    const cleaned = hex.replace('#', '');
    const r = parseInt(cleaned.substring(0, 2), 16) || 0;
    const g = parseInt(cleaned.substring(2, 4), 16) || 0;
    const b = parseInt(cleaned.substring(4, 6), 16) || 0;
    return `${r}, ${g}, ${b}`;
  }

  const HEADER_FONT_SIZE = '4rem';

  // Include fitVersion so React recomputes the style reliably after auto-fit updates.
  // (Even though fitScaleRef is a ref, fitVersion is state.)

  const getLowerThirdY = () => {
    if (ss.lowerThirdPosition === 'bottom-10') return '85%';
    if (ss.lowerThirdPosition === 'bottom-20') return '75%';
    if (ss.lowerThirdPosition === 'custom' && ss.lowerThirdY !== undefined) return `${ss.lowerThirdY}%`;
    return '80%';
  };

  const customStyles: React.CSSProperties = {
    fontFamily: ss.fontFamily || 'system-ui',
    fontSize: isLowerThird || ss.lowerThirdMode === 'lyrics'
      ? '2.4rem' 
      : `${6 * fitScaleRef.current * (ss.fontSizeScale || 1.0)}rem`,
    fontWeight: ss.bold ? 'bold' : 'normal',
    fontStyle: ss.italic ? 'italic' : 'normal',
    textDecoration: ss.underline ? 'underline' : 'none',
    color: ss.color || '#ffffff',
    textAlign: ss.alignment || 'center',
    lineHeight: ss.lineSpacing || 1.2,
    letterSpacing: ss.letterSpacing ? `${ss.letterSpacing}px` : 'normal',
    
    // Shadows
    textShadow: ss.shadowEnabled
      ? `${ss.shadowX ?? 2}px ${ss.shadowY ?? 2}px ${ss.shadowBlur ?? 4}px ${ss.shadowColor || '#000000'}`
      : 'none',

    // Stroke Outline
    WebkitTextStroke: ss.strokeEnabled
      ? `${ss.strokeWidth ?? 2}px ${ss.strokeColor || '#000000'}`
      : 'none',
  };

  // Animation Timing and Curve Constants
  const duration = ss.transitionDuration !== undefined ? ss.transitionDuration : 0.6;
  // motion typing expects `ease` as `Easing | Easing[]`.
  // Keep runtime value the same, but cast to satisfy TS.
  const easeCurve = [0.16, 1, 0.3, 1] as unknown as any; // Premium cubic-bezier curve



  // Slide Transitions Variant Generator
  const getVariants = () => {
    const type = ss.transitionType || 'fade';
    switch (type) {

      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 60 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -60 }
        };
      case 'slide-down':
        return {
          initial: { opacity: 0, y: -60 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 60 }
        };
      case 'slide-left':
        return {
          initial: { opacity: 0, x: 60 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -60 }
        };
      case 'slide-right':
        return {
          initial: { opacity: 0, x: -60 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 60 }
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
    }
  };

  const variants = getVariants();

  // Staggered Per-Word Animation Child Variant Generator
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.04,
        staggerDirection: -1 as any
      }
    }
  };

  const wordChildVariants = {
    initial: (type: string) => {
      if (type === 'slide-up') return { opacity: 0, y: 15 };
      if (type === 'slide-down') return { opacity: 0, y: -15 };
      if (type === 'slide-left') return { opacity: 0, x: 15 };
      if (type === 'slide-right') return { opacity: 0, x: -15 };
      return { opacity: 0 };
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: duration * 0.7, ease: easeCurve as any }

    },
    exit: (type: string) => {
      if (type === 'slide-up') return { opacity: 0, y: -15, transition: { duration: duration * 0.5 } };
      if (type === 'slide-down') return { opacity: 0, y: 15, transition: { duration: duration * 0.5 } };
      if (type === 'slide-left') return { opacity: 0, x: -15, transition: { duration: duration * 0.5 } };
      if (type === 'slide-right') return { opacity: 0, x: 15, transition: { duration: duration * 0.5 } };
      return { opacity: 0, transition: { duration: duration * 0.5 } };
    }
  };

  // Continuous Loop Animation Variant Selector
  const getLoopProps = () => {
    const loop = ss.loopAnimation || 'none';
    if (loop === 'pulse') {
      return {
        animate: { 
          opacity: [0.9, 1.0, 0.9],
          scale: [1, 1.015, 1]
        },
        transition: { repeat: Infinity, duration: 3.0, ease: 'easeInOut' as any }
      };
    }

    if (loop === 'float') {
      return {
        animate: { y: [0, -6, 0] },
        transition: { repeat: Infinity, duration: 4.0, ease: 'easeInOut' as any }
      };
    }
    return {};
  };

  const loopProps = getLoopProps();

  const renderTextContent = () => {
    const isBilingual = ss.bilingualEnabled && cleanText.includes('---');

    if (isBilingual) {
      const parts = cleanText.split(/\r?\n?---\r?\n?/);
      const primaryText = parts[0] || '';
      const secondaryText = parts[1] || '';

      if (ss.perWordAnimation) {
        const primaryWords = primaryText.split(/(\s+)/);
        const secondaryWords = secondaryText.split(/(\s+)/);

        return (
          <motion.p
            ref={textFitRef}
            key={cleanText}
            data-base-font-size="6"
            data-fit-version={fitVersion}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="break-words whitespace-pre-wrap w-full h-full flex flex-col items-center justify-center m-0 font-bold"
            style={customStyles}
          >
            <span className="w-full flex flex-wrap items-center justify-center">
              {primaryWords.map((word, idx) => {
                if (/^\s+$/.test(word)) return <span key={idx}>{word}</span>;
                return (
                  <motion.span
                    key={idx}
                    variants={wordChildVariants}
                    custom={ss.transitionType || 'fade'}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
            <span className="w-1/4 my-2.5 border-t border-white/20 opacity-30 inline-block shrink-0" />
            <span className="w-full flex flex-wrap items-center justify-center opacity-85 font-normal italic" style={{ fontSize: '0.75em' }}>
              {secondaryWords.map((word, idx) => {
                if (/^\s+$/.test(word)) return <span key={idx}>{word}</span>;
                return (
                  <motion.span
                    key={idx}
                    variants={wordChildVariants}
                    custom={ss.transitionType || 'fade'}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
          </motion.p>
        );
      }

      return (
        <motion.p
          ref={textFitRef}
          key={cleanText}
          data-base-font-size="6"
          data-fit-version={fitVersion}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration, ease: easeCurve as any }}
          style={customStyles}
        >
          <span className="w-full">{primaryText}</span>
          <span className="w-1/4 my-2.5 border-t border-white/20 opacity-30 inline-block shrink-0" />
          <span className="w-full opacity-85 font-normal italic" style={{ fontSize: '0.75em' }}>{secondaryText}</span>
        </motion.p>
      );
    }

    if (ss.perWordAnimation && cleanText) {
      const words = cleanText.split(/(\s+)/);
      return (
        <motion.p
          ref={textFitRef}
          key={cleanText}
          data-base-font-size="6"
          data-fit-version={fitVersion}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="break-words whitespace-pre-wrap w-full h-full flex flex-wrap items-center justify-center m-0 font-bold"
          style={customStyles}
        >
          {words.map((word, idx) => {
            if (/^\s+$/.test(word)) {
              return <span key={idx}>{word}</span>;
            }
            return (
              <motion.span
                key={idx}
                variants={wordChildVariants}
                custom={ss.transitionType || 'fade'}
                className="inline-block"
              >
                {word}
              </motion.span>
            );
          })}
        </motion.p>
      );
    }

    return (
      <motion.p
        ref={textFitRef}
        key={cleanText}
        data-base-font-size="6"
        data-fit-version={fitVersion}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration, ease: easeCurve as any }}
        className="break-words whitespace-pre-wrap w-full h-full flex items-center justify-center m-0 font-bold"
        style={customStyles}
      >
        {cleanText}
      </motion.p>
    );
  };


  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-black cursor-pointer" 
      onDoubleClick={handleDoubleClick}
      title="Double click to close, or use arrow keys/space to move slides"
    >
      <div className="w-full h-full flex flex-col relative select-none bg-black">
        {/* Background Engine */}
        <BackgroundRenderer
          type={ss?.bgType || activeBackground?.type || 'black'}
          config={ss?.bgConfig || activeBackground?.config || { color: '#000000', opacity: 1 }}
          transition={ss?.bgTransition || 'dissolve'}
          transitionDuration={ss?.bgTransitionDuration ?? 0.8}
        />

        {/* Dim Overlay for text readability */}
        <DimOverlay opacity={ss?.dimOverlay ?? 0} />

        {!isBlackout ? (
          <div className="relative z-10 w-full h-full flex flex-col p-[2%]">
            
            {/* 2. FULLSCREEN CENTER CONTENT */}
            {!isTextCleared && text && !(isLowerThird || ss.lowerThirdMode === 'lyrics') && ss.lowerThirdMode !== 'speaker' && ss.lowerThirdMode !== 'ticker' && (
              activeMode === 'BIBLE' && copyright ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[4%]">
                  <div className="flex flex-col items-center gap-4 mb-10 shrink-0">
                    <h2
                      style={{
                        fontSize: `${bibleHeadingFontSize}px`,
                        color: bibleHeadingFontColor,
                      }}
                      className="font-semibold tracking-[0.15em] select-none leading-none"
                    >
                      {copyright}
                    </h2>
                    <div className="w-20 h-[3px] bg-orange-500/60 rounded-full" />
                  </div>
                  <motion.div
                    ref={textFitRef}
                    key={cleanText}
                    data-base-font-size="6"
                    data-fit-version={fitVersion}
                    variants={variants}
                    initial={variants.initial}
                    animate={variants.animate}
                    exit={variants.exit}
                    transition={{ duration, ease: easeCurve as any }}
                    className="w-full flex items-center justify-center"
                    style={{
                      fontSize: `${bibleVerseFontSize}px`,
                      color: bibleVerseFontColor,
                      fontFamily: ss.fontFamily || 'system-ui',
                      lineHeight: 1.3,
                      textAlign: 'center',
                      letterSpacing: '0.02em',
                      textShadow: ss.shadowEnabled
                        ? `${ss.shadowX ?? 2}px ${ss.shadowY ?? 2}px ${ss.shadowBlur ?? 4}px ${ss.shadowColor || '#000000'}`
                        : 'none',
                      WebkitTextStroke: ss.strokeEnabled
                        ? `${ss.strokeWidth ?? 2}px ${ss.strokeColor || '#000000'}`
                        : 'none',
                    }}
                  >
                    <div className="max-w-[90%] leading-[1.4] font-medium break-words whitespace-pre-wrap text-center">
                      {cleanText}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div 
                  className="flex-1 flex items-center justify-center min-h-0"
                  {...loopProps}
                >
                  <AnimatePresence mode="popLayout">
                    {renderTextContent()}
                  </AnimatePresence>
                </motion.div>
              )
            )}

            {/* 3. LOWER THIRD LYRICS BAND OVERLAY WITH CUSTOM BAR BACKING AND POSITION */}
            {!isTextCleared && text && (isLowerThird || ss.lowerThirdMode === 'lyrics') && (
              <div 
                className="absolute left-0 right-0 w-full flex items-center justify-center transition-all duration-300 z-30"
                style={{
                  top: getLowerThirdY(),
                  transform: 'translateY(-50%)',
                  backgroundColor: ss.lowerThirdBgColor 
                    ? `rgba(${hexToRgb(ss.lowerThirdBgColor)}, ${ss.lowerThirdBgOpacity ?? 0.65})` 
                    : 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: ss.lowerThirdBgBlur ? 'blur(8px)' : 'none',
                  WebkitBackdropFilter: ss.lowerThirdBgBlur ? 'blur(8px)' : 'none',
                  padding: '1.25rem 2rem',
                  minHeight: '4.5rem'
                }}
              >
                <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    {renderTextContent()}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* 4. SPEAKER BANNER LAYOUT */}
            {ss.lowerThirdMode === 'speaker' && (
              <AnimatePresence>
                <motion.div 
                  initial={{ x: -150, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -150, opacity: 0 }}
                  transition={{ duration: ss.transitionDuration || 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-10 md:left-20 flex items-stretch transition-all duration-300 z-30"
                  style={{
                    top: getLowerThirdY(),
                    transform: 'translateY(-50%)',
                    backgroundColor: ss.lowerThirdBgColor 
                      ? `rgba(${hexToRgb(ss.lowerThirdBgColor)}, ${ss.lowerThirdBgOpacity ?? 0.75})` 
                      : 'rgba(24, 24, 27, 0.85)',
                    backdropFilter: ss.lowerThirdBgBlur ? 'blur(10px)' : 'none',
                    WebkitBackdropFilter: ss.lowerThirdBgBlur ? 'blur(10px)' : 'none',
                    borderRadius: '1rem',
                    borderLeft: '5px solid #f97316', // solid orange accent edge
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)'
                  }}
                >
                  <div className="px-6 py-4 flex flex-col justify-center text-left">
                    <h3 className="text-white text-[1.6rem] font-bold tracking-wide leading-tight">
                      {ss.speakerName || 'Speaker Name'}
                    </h3>
                    {ss.speakerTitle && (
                      <p className="text-orange-400 text-[1.0rem] font-medium tracking-wider uppercase mt-0.5 leading-none font-sans">
                        {ss.speakerTitle}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* 5. ANNOUNCEMENT TICKER LAYOUT */}
            {ss.lowerThirdMode === 'ticker' && (
              <div 
                className="absolute left-0 right-0 w-full overflow-hidden flex items-center transition-all duration-300 z-30"
                style={{
                  top: getLowerThirdY(),
                  transform: 'translateY(-50%)',
                  backgroundColor: ss.lowerThirdBgColor 
                    ? `rgba(${hexToRgb(ss.lowerThirdBgColor)}, ${ss.lowerThirdBgOpacity ?? 0.8})` 
                    : 'rgba(9, 9, 11, 0.9)',
                  backdropFilter: ss.lowerThirdBgBlur ? 'blur(8px)' : 'none',
                  WebkitBackdropFilter: ss.lowerThirdBgBlur ? 'blur(8px)' : 'none',
                  height: '3.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="w-full relative flex items-center">
                  <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{
                      repeat: Infinity,
                      ease: 'linear' as any,

                      duration: ss.tickerSpeed || 20
                    }}
                    className="whitespace-nowrap font-mono text-[1.2rem] text-white/95 font-bold tracking-wide pl-4"
                  >
                    {ss.tickerText || 'Welcome to church! Announcements: Youth Fellowship on Sunday 5PM. Bible Study on Wednesday 7:30PM.'}
                  </motion.div>
                </div>
              </div>
            )}

            {/* 6. SPEECH TO TEXT LIVE CAPTIONS OVERLAY */}
            {liveCaptionText && (
              <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/85 backdrop-blur-md border border-zinc-800 px-6 py-3.5 rounded-2xl shadow-2xl text-center"
                >
                  <p className="text-orange-450 font-mono text-[9px] tracking-wider uppercase font-extrabold mb-0.5 animate-pulse flex items-center justify-center gap-1.5 select-none">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block animate-ping" />
                    Live Captions
                  </p>
                  <p className="text-white text-[1.25rem] font-medium tracking-wide leading-relaxed font-sans">
                    {liveCaptionText}
                  </p>
                </motion.div>
              </div>
            )}

            {/* 7. COPYRIGHT SONGS FOOTER */}
            {!isTextCleared && text && copyright && activeMode === 'SONGS' && (
              <div className="shrink-0 pt-2 text-[0.8rem] text-center text-white/55 font-sans tracking-wider opacity-60">
                {copyright}
              </div>
            )}

          </div>
        ) : (
          <div className="text-transparent flex-1 select-none pointer-events-none z-10 flex items-center justify-center">Cleared Stage</div>
        )}


      </div>
    </div>
  );
}
