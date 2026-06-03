import React, { useMemo } from 'react';
import { Presentation, Slide } from '../types';
import { Radio, Tv, Trash2, ListMusic, ArrowRight, History, Star } from 'lucide-react';

interface LiveMonitorProps {
  activePresentation: Presentation | null;
  activeSlideIndex: number | null;
  isTextCleared: boolean;
  onToggleClearText: () => void;
  isBlackout: boolean;
  onToggleBlackout: () => void;
  
  // Stage state parameters
  theme: 'stage' | 'dark' | 'cinematic';
  customBgImage: string | null;
  customBgVideo: string | null;
  customSolidBgColor: string;
  
  // Lower-Third livestream formatting props
  isLowerThird: boolean;
  onToggleLowerThird: () => void;
  
  fontSize: number;
  onProjectToTV: () => void;

  // Custom typography states for rendering live preview perfectly!
  fontFamily: string;
  customGoogleFont: string;
  fontColor: string;
  textAlignment: 'center' | 'left' | 'right';
  fontStyle: 'normal' | 'italic';
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  lineHeight: 'compact' | 'normal' | 'loose';
  letterSpacing: 'normal' | 'wide' | 'widest';
  textShadow: boolean;
  overlayOpacity: number;
  overlayColor: string;

  // Expanded Adjustable parameters
  letterSpacingPx: number;
  lineHeightVal: number;
  textShadowX: number;
  textShadowY: number;
  textShadowBlur: number;
  textShadowColor: string;
  textStrokeWidth: number;
  textStrokeColor: string;
  allCapsEnabled: boolean;
  titleCasingEnabled: boolean;
  safeMarginTop: number;
  safeMarginBottom: number;
  safeMarginLeft: number;
  safeMarginRight: number;
  verticalAlignment: 'top' | 'middle' | 'bottom';
  textGradientEnabled: boolean;
  textGradientStart: string;
  textGradientEnd: string;
  textGradientDirection: string;
  highlightWordsEnabled: boolean;
  highlightWordsList: string;
  highlightWordsColor: string;
  bibleDescPosition?: string;
  activeMode: string;

  // ProPresenter preview state variables
  textScalingMode: 'fit' | 'fill' | 'none';
  textBgFill: 'none' | 'solid' | 'gradient';
  textBgFillColor: string;
  textBgFillOpacity: number;
  textBgFillGradientStart: string;
  textBgFillGradientEnd: string;
  textBgFillPadding: number;
  textBgFillBorderRadius: number;
  textShadowAngle: number;
  textShadowDistance: number;
  textShadowOpacity: number;
  textOutlineDouble: boolean;
  bibleHeadingFontSize: number;
  bibleHeadingFontColor: string;
  bibleHeadingBgColor: string;
  bibleHeadingBgOpacity: number;
  bibleVerseFontSize: number;
  bibleVerseFontColor: string;
  bibleVerseBgColor: string;
  bibleVerseBgOpacity: number;

  // Setlist parameters
  setlist?: { uniqueId: string; presentationId: string; title: string }[];
  onRemoveFromSetlist?: (uniqueId: string) => void;
  onSelectPresentation?: (id: string) => void;

  // Premium Bible Hub parameters
  bibleHistory?: { bookId: string; bookName: string; chapter: number; verse: number }[];
  bibleSavedVerses?: { bookId: string; bookName: string; chapter: number; verse: number; primaryText: string; refText?: string }[];
  onRemoveSavedVerse?: (bookId: string, chapter: number, verse: number) => void;
  onJumpToVerse?: (bookId: string, chapter: number, verse: number) => void;
}

export default function LiveMonitor({
  activePresentation,
  activeSlideIndex,
  isTextCleared,
  onToggleClearText,
  isBlackout,
  onToggleBlackout,
  theme,
  customBgImage,
  customBgVideo,
  customSolidBgColor,
  isLowerThird,
  onToggleLowerThird,
  fontSize,
  onProjectToTV,
  fontFamily,
  customGoogleFont,
  fontColor,
  textAlignment,
  fontStyle,
  fontWeight,
  lineHeight,
  letterSpacing,
  textShadow,
  overlayOpacity,
  overlayColor,
  bibleDescPosition = 'top_separate',

  // Extra customizable properties
  letterSpacingPx,
  lineHeightVal,
  textShadowX,
  textShadowY,
  textShadowBlur,
  textShadowColor,
  textStrokeWidth,
  textStrokeColor,
  allCapsEnabled,
  titleCasingEnabled,
  safeMarginTop,
  safeMarginBottom,
  safeMarginLeft,
  safeMarginRight,
  verticalAlignment,
  textGradientEnabled,
  textGradientStart,
  textGradientEnd,
  textGradientDirection,
  highlightWordsEnabled,
  highlightWordsList,
  highlightWordsColor,
  activeMode,

  // Custom ProPresenter preview states
  textScalingMode,
  textBgFill,
  textBgFillColor,
  textBgFillOpacity,
  textBgFillGradientStart,
  textBgFillGradientEnd,
  textBgFillPadding,
  textBgFillBorderRadius,
  textShadowAngle,
  textShadowDistance,
  textShadowOpacity,
  textOutlineDouble,
  bibleHeadingFontSize,
  bibleHeadingFontColor,
  bibleHeadingBgColor,
  bibleHeadingBgOpacity,
  bibleVerseFontSize,
  bibleVerseFontColor,
  bibleVerseBgColor,
  bibleVerseBgOpacity,

  // Setlist props
  setlist = [],
  onRemoveFromSetlist,
  onSelectPresentation,

  // Bible Hub props
  bibleHistory = [],
  bibleSavedVerses = [],
  onRemoveSavedVerse,
  onJumpToVerse
}: LiveMonitorProps) {

  const [bibleHubTab, setBibleHubTab] = React.useState<'history' | 'saved'>('history');

  const activeSlide: Slide | null = useMemo(() => {
    if (activePresentation && activeSlideIndex !== null) {
      return activePresentation.slides[activeSlideIndex] || null;
    }
    return null;
  }, [activePresentation, activeSlideIndex]);

  const isDisplayingText = activeSlide && !isTextCleared && !isBlackout;

  const getAppliedPositionText = (rawText: string, copyrightText: string, mode: string, position: string) => {
    if (!rawText) return '';
    if (mode !== 'BIBLE' || !copyrightText) return rawText;
    if (position === 'beginning') {
      return `[${copyrightText}] - ${rawText}`;
    }
    if (position === 'end') {
      return `${rawText} (${copyrightText})`;
    }
    if (position === 'top_line') {
      return `${copyrightText}\n${rawText}`;
    }
    if (position === 'bottom_line') {
      return `${rawText}\n${copyrightText}`;
    }
    return rawText;
  };

  const activeText = activeSlide ? activeSlide.text : '';
  const processedText = getAppliedPositionText(activeText, activePresentation?.copyright || '', activeMode, bibleDescPosition);

  const getThemeClasses = () => {
    if (isBlackout) {
      return {
        bg: 'bg-black border-zinc-900',
        text: 'text-zinc-700'
      };
    }

    let bgClass = '';
    let textClass = '';

    switch (theme) {
      case 'stage':
        bgClass = 'bg-black border-zinc-850';
        textClass = 'text-yellow-400 font-sans tracking-wide font-black';
        break;
      case 'dark':
        bgClass = 'bg-gradient-to-br from-slate-900 to-slate-800 border-zinc-750 shadow-inner';
        textClass = 'text-white font-sans [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)] leading-relaxed font-bold';
        break;
      case 'cinematic':
        bgClass = 'bg-gradient-to-r from-blue-900 to-indigo-900 border-indigo-950/60 shadow-inner';
        textClass = 'text-white font-sans tracking-wide leading-relaxed [text-shadow:_0_2px_8px_rgba(66,153,225,0.4)] font-bold';
        break;
    }

    return { bg: bgClass, text: textClass };
  };

  const currentTheme = getThemeClasses();

  const getPreviewStyles = (): React.CSSProperties => {
    if (isBlackout) {
      return { backgroundColor: '#000000' };
    }
    const styles: React.CSSProperties = {};
    if (customBgImage) {
      styles.backgroundImage = `url(${customBgImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
    } else if (customSolidBgColor && customSolidBgColor !== '#0a0a0a') {
      styles.backgroundColor = customSolidBgColor;
    }
    return styles;
  };

  // Dynamic font scaling formula to keep text within safe screen margins and prevent truncation
  const getFontSizeMultiplier = (txt: string, scalingMode: 'fit' | 'fill' | 'none'): number => {
    if (!txt) return 1.0;
    if (scalingMode === 'none') return 1.0;
    
    const len = txt.length;
    if (scalingMode === 'fill') {
      if (len <= 30) return 1.55;
      if (len <= 60) return 1.30;
      if (len <= 100) return 1.15;
      if (len <= 180) return 1.0;
      return Math.max(0.48, 1.0 - ((len - 180) / 250) * 0.4);
    }
    
    // Default 'fit' mode
    if (len <= 80) return 1.0;
    if (len <= 150) {
      return 1.0 - ((len - 80) / 70) * 0.15;
    }
    if (len <= 250) {
      return 0.85 - ((len - 150) / 100) * 0.20;
    }
    if (len <= 450) {
      return 0.65 - ((len - 250) / 200) * 0.17;
    }
    return Math.max(0.38, 0.48 - ((len - 450) / 400) * 0.10);
  };

  const getComputedRgba = (hex: string, opacity: number): string => {
    if (!hex || !hex.startsWith('#')) return `rgba(0,0,0,${opacity / 100})`;
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${opacity / 100})`;
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const getPreviewTextStyle = (): React.CSSProperties => {
    const scaleFactor = getFontSizeMultiplier(processedText, textScalingMode);
    const baseSize = activeMode === 'BIBLE' ? (bibleVerseFontSize / 8) : fontSize;
    const scaledSize = baseSize * scaleFactor;

    const style: React.CSSProperties = {
      fontSize: `${Math.max(0.48, (scaledSize - 1.25) * 0.24)}rem`,
    };

    // Font Family selection
    let activeFamily = fontFamily;
    if (fontFamily === 'Custom Google Font' && customGoogleFont) {
      activeFamily = customGoogleFont;
    }
    
    if (activeFamily && activeFamily !== 'default' && activeFamily !== 'sans') {
      style.fontFamily = `"${activeFamily}", sans-serif`;
    }

    // Color customization
    if (activeMode === 'BIBLE' && bibleVerseFontColor) {
      style.color = bibleVerseFontColor;
    } else if (fontColor) {
      style.color = fontColor;
    }

    // Alignment
    if (textAlignment) {
      style.textAlign = textAlignment;
    }

    // Italic
    if (fontStyle === 'italic') {
      style.fontStyle = 'italic';
    }

    // Line heights
    if (lineHeightVal && lineHeightVal > 0) {
      style.lineHeight = lineHeightVal;
    } else {
      if (lineHeight === 'compact') style.lineHeight = 1.15;
      else if (lineHeight === 'loose') style.lineHeight = 1.55;
      else style.lineHeight = 1.30;
    }

    // Letter spacing (Tracking)
    if (letterSpacingPx !== undefined && letterSpacingPx !== 0) {
      style.letterSpacing = `${letterSpacingPx / 4.2}px`;
    } else {
      if (letterSpacing === 'wide') style.letterSpacing = '0.05em';
      else if (letterSpacing === 'widest') style.letterSpacing = '0.12em';
      else style.letterSpacing = 'normal';
    }

    // Font Weight
    if (fontWeight === 'normal') style.fontWeight = 400;
    else if (fontWeight === 'medium') style.fontWeight = 500;
    else if (fontWeight === 'bold') style.fontWeight = 700;
    else if (fontWeight === 'black') style.fontWeight = 900;

    // Text Drop Shadow Generator & Double Outlines (scaled to preview)
    const rad = (textShadowAngle * Math.PI) / 180;
    const rawX = textShadowDistance * Math.cos(rad);
    const rawY = textShadowDistance * Math.sin(rad);

    const computedX = rawX / 4.2;
    const computedY = rawY / 4.2;
    const sb = Math.max(0.5, (textShadowBlur ?? 6) / 4.2);

    const outlineColor = textStrokeColor || '#000000';
    const outlineWidth = textStrokeWidth || 0;
    
    const previewOutlineWidth = outlineWidth > 0 ? outlineWidth / 4.2 : 0;
    
    const outlineShadows = previewOutlineWidth > 0 ? `
      -${previewOutlineWidth}px -${previewOutlineWidth}px 0 ${outlineColor},  
       ${previewOutlineWidth}px -${previewOutlineWidth}px 0 ${outlineColor}, 
      -${previewOutlineWidth}px  ${previewOutlineWidth}px 0 ${outlineColor},  
       ${previewOutlineWidth}px  ${previewOutlineWidth}px 0 ${outlineColor},
      -${previewOutlineWidth}px 0px 0 ${outlineColor},
       ${previewOutlineWidth}px 0px 0 ${outlineColor},
       0px -${previewOutlineWidth}px 0 ${outlineColor},
       0px  ${previewOutlineWidth}px 0 ${outlineColor}
    ` : '';

    let textShadowValue = '';
    if (textOutlineDouble && outlineWidth > 0) {
      textShadowValue = outlineShadows;
    }
    
    if (textShadow) {
      const shadowColorRgba = getComputedRgba(textShadowColor || '#000000', textShadowOpacity ?? 95);
      const shadowItem = `${computedX}px ${computedY}px ${sb}px ${shadowColorRgba}`;
      textShadowValue = textShadowValue ? `${textShadowValue}, ${shadowItem}` : shadowItem;
    }

    if (textShadowValue) {
      style.textShadow = textShadowValue;
    } else {
      style.textShadow = 'none';
    }

    // Text Outline / Stroke standard mode
    if (textStrokeWidth && textStrokeWidth > 0 && !textOutlineDouble) {
      style.WebkitTextStroke = `${Math.max(0.4, textStrokeWidth / 4.2)}px ${textStrokeColor}`;
    } else {
      style.WebkitTextStroke = 'initial';
    }

    // Text Gradients
    if (textGradientEnabled) {
      const start = textGradientStart ?? '#f97316';
      const end = textGradientEnd ?? '#fbbf24';
      const dir = textGradientDirection ?? 'to right';
      style.backgroundImage = `linear-gradient(${dir}, ${start}, ${end})`;
      style.WebkitBackgroundClip = 'text';
      style.WebkitTextFillColor = 'transparent';
      style.color = 'transparent';
    } else {
      style.backgroundImage = 'none';
      style.WebkitBackgroundClip = 'initial';
      style.WebkitTextFillColor = 'initial';
    }

    style.wordBreak = 'break-word';
    style.whiteSpace = 'pre-wrap';
    style.overflowWrap = 'break-word';

    return style;
  };

  const getPreviewTextBgSpanStyle = (): React.CSSProperties => {
    if (textBgFill === 'none') {
      return { display: 'inline' };
    }
    
    const scaledPadding = Math.max(1, (textBgFillPadding ?? 12) / 4.2);
    const scaledRadius = Math.max(1, (textBgFillBorderRadius ?? 8) / 4.2);

    const style: React.CSSProperties = {
      padding: `${scaledPadding}px`,
      borderRadius: `${scaledRadius}px`,
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
      display: 'inline',
    };

    if (textBgFill === 'solid') {
      style.backgroundColor = getComputedRgba(textBgFillColor || '#000000', textBgFillOpacity ?? 60);
    } else if (textBgFill === 'gradient') {
      const startG = getComputedRgba(textBgFillGradientStart || '#000000', textBgFillOpacity ?? 60);
      const endG = getComputedRgba(textBgFillGradientEnd || '#1a1a1a', textBgFillOpacity ?? 60);
      style.backgroundImage = `linear-gradient(to right, ${startG}, ${endG})`;
    }

    return style;
  };

  const getPreviewOverlayStyle = (): React.CSSProperties => {
    if (activeMode === 'BIBLE') {
      const hex = (bibleVerseBgColor && bibleVerseBgColor.startsWith('#')) ? bibleVerseBgColor.replace('#', '') : '000000';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgbColor = (!isNaN(r) && !isNaN(g) && !isNaN(b)) ? `${r}, ${g}, ${b}` : '0, 0, 0';
      return {
        backgroundColor: `rgba(${rgbColor}, ${(bibleVerseBgOpacity ?? 0) / 100})`,
        padding: '0.4rem 0.8rem',
        borderRadius: '0.5rem',
        border: (bibleVerseBgOpacity ?? 0) > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        width: '95%',
        margin: '0 auto'
      };
    }

    if (overlayOpacity && overlayOpacity > 0) {
      // Hex to RGB
      let rgbColor = '0, 0, 0';
      if (overlayColor && overlayColor.startsWith('#')) {
        const hex = overlayColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          rgbColor = `${r}, ${g}, ${b}`;
        }
      }
      return {
        backgroundColor: `rgba(${rgbColor}, ${overlayOpacity / 100})`,
        backdropFilter: 'blur(4px)',
        padding: '0.5rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(255,255,255,0.08)',
        width: '95%',
        margin: '0 auto'
      };
    }
    return {};
  };

  const getPreviewHeadingStyle = (): React.CSSProperties => {
    if (activeMode === 'BIBLE') {
      const hex = (bibleHeadingBgColor && bibleHeadingBgColor.startsWith('#')) ? bibleHeadingBgColor.replace('#', '') : '101010';
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const rgbColor = (!isNaN(r) && !isNaN(g) && !isNaN(b)) ? `${r}, ${g}, ${b}` : '10, 10, 10';

      return {
        fontSize: `${bibleHeadingFontSize * 0.045}rem`,
        color: bibleHeadingFontColor || '#ffffff',
        backgroundColor: `rgba(${rgbColor}, ${(bibleHeadingBgOpacity ?? 60) / 100})`,
        border: (bibleHeadingBgOpacity ?? 0) > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
      };
    }
    return {};
  };

  const getOutputMarginedStyle = (): React.CSSProperties => {
    const defaultPreviewStyles = getPreviewStyles();
    // Scale safe margins down (divide by 5 to fit inside aspect-ratio preview)
    const paddingT = `${(safeMarginTop ?? 2) / 5}rem`;
    const paddingB = `${(safeMarginBottom ?? 2) / 5}rem`;
    const paddingL = `${(safeMarginLeft ?? 4) / 5}rem`;
    const paddingR = `${(safeMarginRight ?? 4) / 5}rem`;

    return {
      ...defaultPreviewStyles,
      paddingTop: paddingT,
      paddingBottom: paddingB,
      paddingLeft: paddingL,
      paddingRight: paddingR,
    };
  };

  const renderFormattedPreviewText = (text: string) => {
    if (!text) return '';
    let processed = text;
    if (allCapsEnabled) {
      processed = processed.toUpperCase();
    } else if (titleCasingEnabled) {
      processed = processed.replace(/\b\w/g, c => c.toUpperCase());
    }

    if (!highlightWordsEnabled || !highlightWordsList || !highlightWordsColor) {
      return processed;
    }

    // Split highlight target words
    const targets = highlightWordsList
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (targets.length === 0) {
      return processed;
    }

    // Build regex that catches words safely with Tamil/Unicode compatibility
    const escapedWords = targets.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    try {
      const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
      const parts = processed.split(regex);
      return parts.map((part, index) => {
        const isMatch = targets.some(tgt => tgt.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <span key={index} style={{ color: highlightWordsColor, fontWeight: 'bold' }}>
              {part}
            </span>
          );
        }
        return part;
      });
    } catch (e) {
      return processed;
    }
  };

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-900 flex flex-col h-full shrink-0 select-none font-sans" id="right-column">
      
      <div className="p-4 py-5 border-b border-zinc-900/60 flex items-center justify-between shrink-0 bg-neutral-950">
        <h2 className="text-[11px] font-display font-extrabold uppercase tracking-[0.15em] text-zinc-450">
          Live Monitor
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBlackout ? 'bg-rose-505' : isTextCleared ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold pr-1 tracking-wider">
            {isBlackout ? 'BLACKOUT' : isTextCleared ? 'CLEARED' : 'ON AIR'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
        
        <div className="space-y-4 shrink-0">
          
          <button
            type="button"
            onClick={onProjectToTV}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:brightness-110 text-white text-xs font-display font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-orange-950/20 active:scale-[0.98] border border-orange-400/20 ring-1 ring-orange-500/30"
            title="Open borderless projection window to stream output directly to external TV screen or projector"
            id="btn-project-tv"
          >
            <Tv className="w-4 h-4 text-white animate-pulse" />
            <span>Project to TV Screen</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest flex items-center gap-1 font-bold">
              <Radio className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
              Live Stage Preview
            </span>
            {activeSlide && (
              <span className="text-[9px] font-mono text-zinc-650 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-900/80">
                Slide {activeSlideIndex! + 1}
              </span>
            )}
          </div>

          <div 
            style={getOutputMarginedStyle()}
            className={`w-full aspect-video rounded-xl border relative flex flex-col transition-[transform,opacity] duration-300 will-change-transform shadow-2xl overflow-hidden ${
              isLowerThird 
                ? 'items-start justify-end text-left' 
                : `${verticalAlignment === 'top' ? 'justify-start' : verticalAlignment === 'bottom' ? 'justify-end' : 'justify-center'} ${
                    textAlignment === 'left' ? 'items-start' : textAlignment === 'right' ? 'items-end' : 'items-center'
                  } text-center`
            } ${
              customBgVideo || customBgImage || (customSolidBgColor && customSolidBgColor !== '#0a0a0a') ? 'border-zinc-850 bg-zinc-950' : currentTheme.bg
            }`}
            id="live-broadcaster-frame"
          >
            {customBgVideo && !isBlackout && (
              <video
                src={customBgVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              />
            )}

            {(!isDisplayingText && !isBlackout && theme === 'stage' && !customBgImage && !customBgVideo && customSolidBgColor === '#0a0a0a') && (
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:10px_10px]" />
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20 select-none">
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/85 rounded-md border border-zinc-900/85">
                <span className={`w-1.5 h-1.5 rounded-full ${isBlackout ? 'bg-zinc-650' : 'bg-rose-500 animate-pulse'}`} />
                <span className="text-[7px] font-mono text-zinc-450 tracking-wider font-extrabold uppercase">PROJECTED OUTPUT</span>
              </div>
            </div>

            {isDisplayingText && activePresentation?.copyright && !isLowerThird && bibleDescPosition === 'top_separate' && (
              <div className="w-full text-center shrink-0 mb-2 mt-2 animate-fade-in z-10">
                <span 
                  className="text-[7px] md:text-[8px] font-sans font-bold text-white bg-neutral-950/60 border border-white/10 px-2.5 py-1 rounded backdrop-blur-sm tracking-wide inline-block"
                  style={getPreviewHeadingStyle()}
                >
                  {activePresentation.copyright}
                </span>
              </div>
            )}

            {isBlackout ? (
              null
            ) : isTextCleared ? (
              null
            ) : activeSlide ? (
              isLowerThird ? (
                <div 
                  className="animate-fade-in shadow-xl z-10"
                  style={getPreviewOverlayStyle()}
                >
                  <p 
                    style={getPreviewTextStyle()}
                    className="select-text break-words whitespace-pre-line leading-tight text-white"
                  >
                    <span style={getPreviewTextBgSpanStyle()}>
                      {renderFormattedPreviewText(processedText)}
                    </span>
                  </p>
                </div>
              ) : (
                <div 
                  className={`z-10 w-full flex-1 flex flex-col justify-center items-center text-center overflow-hidden ${(processedText.length > 150) ? 'p-[1%]' : 'p-[3%]'}`}
                  style={getPreviewOverlayStyle()}
                >
                  <p 
                    style={getPreviewTextStyle()}
                    className="select-text break-words whitespace-pre-wrap leading-snug w-full text-center transition-all duration-200"
                  >
                    <span style={getPreviewTextBgSpanStyle()}>
                      {renderFormattedPreviewText(processedText)}
                    </span>
                  </p>
                </div>
              )
            ) : (
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-650 flex-1 flex items-center justify-center z-10 mx-auto font-bold">
                No active slide
              </p>
            )}

            {isDisplayingText && activePresentation?.copyright && !isLowerThird && bibleDescPosition === 'bottom_separate' && (
              <div className="w-full text-center shrink-0 mb-2 mt-2 animate-fade-in z-10">
                <span 
                  className="text-[7px] md:text-[8px] font-sans font-bold text-white bg-neutral-950/60 border border-white/10 px-2.5 py-1 rounded backdrop-blur-sm tracking-wide inline-block"
                  style={getPreviewHeadingStyle()}
                >
                  {activePresentation.copyright}
                </span>
              </div>
            )}

            {isDisplayingText && activePresentation?.copyright && !isLowerThird && bibleDescPosition !== 'top_separate' && bibleDescPosition !== 'bottom_separate' && (
              <div className="absolute bottom-1 left-2 right-2 text-center truncate pointer-events-none z-10">
                <span className="text-[6px] font-mono text-zinc-500 uppercase tracking-widest">
                  {activePresentation.copyright}
                </span>
              </div>
            )}
          </div>
        </div>

          {activeMode === 'BIBLE' ? (
          <div className="flex flex-col flex-1 min-h-[220px] bg-zinc-900/10 p-3.5 rounded-xl border border-zinc-900/80 shadow-md space-y-3 animate-fade-in" id="premium-bible-hub">
            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/15">
                  <History className="w-3.5 h-3.5 text-orange-450" />
                </div>
                <div className="text-left">
                  <h3 className="text-[10px] font-mono font-black text-zinc-355 uppercase tracking-widest">
                    Premium Bible Hub
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-sans">
                    Sermon reference & fast recall pool
                  </p>
                </div>
              </div>

              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-850/60 select-none">
                <button
                  type="button"
                  onClick={() => setBibleHubTab('history')}
                  className={`py-1 px-2.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    bibleHubTab === 'history'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-750'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-hub-history"
                >
                  📖 History
                </button>
                <button
                  type="button"
                  onClick={() => setBibleHubTab('saved')}
                  className={`py-1 px-2.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    bibleHubTab === 'saved'
                      ? 'bg-zinc-850 text-orange-400 border border-zinc-750'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-hub-saved"
                >
                  ⭐ Saved
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[280px]" id="bible-hub-content-container">
              {bibleHubTab === 'history' ? (
                bibleHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-650 selection:bg-transparent">
                    <History className="w-6 h-6 text-zinc-800 mb-2 stroke-1" />
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      History is Empty
                    </p>
                    <p className="text-[9px] text-zinc-500 font-sans mt-0.5 max-w-[200px]">
                      Your selected sermon verses will automatically load here.
                    </p>
                  </div>
                ) : (
                  bibleHistory.map((item, idx) => (
                    <div
                      key={`bible-hist-${idx}`}
                      onClick={() => onJumpToVerse?.(item.bookId, item.chapter, item.verse)}
                      className="group flex items-center justify-between text-left rounded-lg p-2.5 transition-all duration-300 border border-transparent bg-zinc-900/20 hover:bg-zinc-900 hover:border-zinc-850 cursor-pointer"
                      id={`bible-history-row-${idx}`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-zinc-600 w-4 text-center">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-300 group-hover:text-orange-400 transition-colors truncate">
                            {item.bookName} {item.chapter}:{item.verse}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-wider group-hover:text-zinc-500">
                        Jump
                      </span>
                    </div>
                  ))
                )
              ) : (
                bibleSavedVerses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-650 selection:bg-transparent">
                    <Star className="w-6 h-6 text-zinc-800 mb-2 stroke-1" />
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      Saved list is Empty
                    </p>
                    <p className="text-[9px] text-zinc-500 font-sans mt-0.5 max-w-[200px]">
                      Bookmark verses in the selector by clicking the ⭐ button.
                    </p>
                  </div>
                ) : (
                  bibleSavedVerses.map((item, idx) => (
                    <div
                      key={`bible-saved-${idx}`}
                      onClick={() => onJumpToVerse?.(item.bookId, item.chapter, item.verse)}
                      className="group flex flex-col text-left rounded-lg p-2.5 border border-transparent hover:border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900 transition-all duration-300 cursor-pointer space-y-1"
                      id={`bible-saved-row-${idx}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">
                          ⭐ {item.bookName} {item.chapter}:{item.verse}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSavedVerse?.(item.bookId, item.chapter, item.verse);
                          }}
                          className="p-1 text-zinc-650 hover:text-rose-450 hover:bg-zinc-805/85 rounded transition-all cursor-pointer opacity-30 group-hover:opacity-100 flex items-center justify-center shrink-0"
                          title="Unsave Verse"
                          id={`btn-unsave-verse-${idx}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] font-sans text-zinc-450 leading-relaxed italic break-words whitespace-normal">
                        {item.primaryText}
                      </p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        ) : (
          /* Setlist */
          <div className="flex flex-col flex-1 min-h-[220px] bg-zinc-900/10 p-3.5 rounded-xl border border-zinc-900/80 shadow-md space-y-3" id="setlist-service-panel">
            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/15">
                  <ListMusic className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <h3 className="text-[10px] font-mono font-black text-zinc-355 uppercase tracking-widest">
                    Service Setlist
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-sans">
                    Queued songs for service plan
                  </p>
                </div>
              </div>
              {setlist.length > 0 && (
                <span className="text-[9px] font-mono font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850 text-zinc-400">
                  {setlist.length} item{setlist.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 max-h-[280px]" id="setlist-queue-container">
              {setlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-650 selection:bg-transparent">
                  <ListMusic className="w-6 h-6 text-zinc-800 mb-2 stroke-1" />
                  <p className="text-[10px] font-mono uppercase tracking-widest font-bold">
                    Setlist is Empty
                  </p>
                  <p className="text-[9px] text-zinc-500 font-sans mt-0.5 max-w-[200px]">
                    Add songs from the library list by clicking the '➕' button.
                  </p>
                </div>
              ) : (
                setlist.map((item, idx) => {
                  // Find index of first queued item that matches activePresentationId
                  const activeIndex = setlist.findIndex(q => q.presentationId === (activePresentation?.id || ''));
                  const isCurrentlyActive = activeIndex === idx && activeMode === 'SONGS';
                  let isUpNext = false;
                  if (activeIndex >= 0) {
                    isUpNext = idx === activeIndex + 1;
                  } else {
                    isUpNext = idx === 0;
                  }

                  return (
                    <div
                      key={item.uniqueId}
                      onClick={() => onSelectPresentation?.(item.presentationId)}
                      className={`group flex items-center justify-between text-left rounded-lg p-2.5 transition-all duration-300 border cursor-pointer ${
                        isCurrentlyActive
                          ? 'bg-orange-500/10 border-orange-500/40 text-white shadow-md'
                          : isUpNext
                          ? 'bg-amber-500/5 hover:bg-zinc-900 border-amber-500/15 text-zinc-300'
                          : 'bg-zinc-900/20 hover:bg-zinc-900 border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                      id={`setlist-row-${item.uniqueId}`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className={`text-[10px] font-mono font-bold w-4 text-center ${
                          isCurrentlyActive ? 'text-orange-400 font-black' : isUpNext ? 'text-amber-400 font-semibold' : 'text-zinc-600'
                        }`}>
                          {idx + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs whitespace-normal break-words leading-tight tracking-wide font-medium ${
                            isCurrentlyActive ? 'text-orange-355 font-bold' : isUpNext ? 'text-zinc-250 font-semibold' : 'text-zinc-400'
                          }`}>
                            {item.title}
                          </p>
                          
                          <div className="flex items-center gap-1.5 mt-1 select-none">
                            {isCurrentlyActive ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 font-extrabold uppercase tracking-widest animate-pulse">
                                <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
                                Active
                              </span>
                            ) : isUpNext ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-mono bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-extrabold uppercase tracking-widest">
                                <ArrowRight className="w-2 h-2" />
                                Up Next
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromSetlist?.(item.uniqueId);
                        }}
                        className="p-1 px-1.5 text-zinc-600 hover:text-rose-400 hover:bg-zinc-800/80 rounded transition-all cursor-pointer opacity-30 group-hover:opacity-100 flex items-center justify-center gap-1 shrink-0"
                        title="Remove from Setlist"
                        id={`btn-remove-setlist-${item.uniqueId}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}


      </div>

    </div>
  );
}
