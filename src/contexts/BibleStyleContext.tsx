import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface BibleStyleState {
  biblePrimaryTranslation: string;
  bibleReferenceTranslation: string;
  bibleDescStyle: string;
  bibleDescSeparator: string;
  bibleDescShowVersion: boolean;
  bibleDescAlignment: string;
  bibleDescLineHeight: number;
  bibleDescPosition: string;
  biblePaginationEnabled: boolean;
  bibleHeadingFontSize: number;
  bibleHeadingFontColor: string;
  bibleHeadingBgColor: string;
  bibleHeadingBgOpacity: number;
  bibleVerseFontSize: number;
  bibleVerseFontColor: string;
  bibleVerseBgColor: string;
  bibleVerseBgOpacity: number;
}

interface BibleStyleActions {
  setBiblePrimaryTranslation: (v: string) => void;
  setBibleReferenceTranslation: (v: string) => void;
  setBibleDescStyle: (v: string) => void;
  setBibleDescSeparator: (v: string) => void;
  setBibleDescShowVersion: (v: boolean) => void;
  setBibleDescAlignment: (v: string) => void;
  setBibleDescLineHeight: (v: number) => void;
  setBibleDescPosition: (v: string) => void;
  setBiblePaginationEnabled: (v: boolean) => void;
  setBibleHeadingFontSize: (v: number) => void;
  setBibleHeadingFontColor: (v: string) => void;
  setBibleHeadingBgColor: (v: string) => void;
  setBibleHeadingBgOpacity: (v: number) => void;
  setBibleVerseFontSize: (v: number) => void;
  setBibleVerseFontColor: (v: string) => void;
  setBibleVerseBgColor: (v: string) => void;
  setBibleVerseBgOpacity: (v: number) => void;
}

type BibleStyleContextType = BibleStyleState & BibleStyleActions;

const LS = (key: string, fallback: string) => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};
const LSN = (key: string, fallback: number) => {
  try { const v = localStorage.getItem(key); return v !== null ? Number(v) : fallback; } catch { return fallback; }
};
const LSB = (key: string, fallback: boolean) => {
  try { const v = localStorage.getItem(key); return v === null ? fallback : v === 'true'; } catch { return fallback; }
};

const SAVE_KEYS: [keyof BibleStyleState, string][] = [
  ['biblePrimaryTranslation', 'bible_primary_translation'],
  ['bibleReferenceTranslation', 'bible_reference_translation'],
  ['bibleDescStyle', 'bible_desc_style'],
  ['bibleDescSeparator', 'bible_desc_separator'],
  ['bibleDescShowVersion', 'bible_desc_show_version'],
  ['bibleDescAlignment', 'bible_desc_alignment'],
  ['bibleDescLineHeight', 'bible_desc_line_height'],
  ['bibleDescPosition', 'bible_desc_position'],
  ['biblePaginationEnabled', 'bible_pagination_enabled'],
  ['bibleHeadingFontSize', 'bible_heading_font_size'],
  ['bibleHeadingFontColor', 'bible_heading_font_color'],
  ['bibleHeadingBgColor', 'bible_heading_bg_color'],
  ['bibleHeadingBgOpacity', 'bible_heading_bg_opacity'],
  ['bibleVerseFontSize', 'bible_verse_font_size'],
  ['bibleVerseFontColor', 'bible_verse_font_color'],
  ['bibleVerseBgColor', 'bible_verse_bg_color'],
  ['bibleVerseBgOpacity', 'bible_verse_bg_opacity'],
];

const BibleStyleContext = createContext<BibleStyleContextType | null>(null);

export function BibleStyleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BibleStyleState>(() => ({
    biblePrimaryTranslation: LS('bible_primary_translation', 'NONE'),
    bibleReferenceTranslation: LS('bible_reference_translation', 'NONE'),
    bibleDescStyle: LS('bible_desc_style', 'bilingual'),
    bibleDescSeparator: LS('bible_desc_separator', ':'),
    bibleDescShowVersion: LSB('bible_desc_show_version', true),
    bibleDescAlignment: LS('bible_desc_alignment', 'inherited'),
    bibleDescLineHeight: LSN('bible_desc_line_height', 8),
    bibleDescPosition: LS('bible_desc_position', 'top_separate'),
    biblePaginationEnabled: LSB('bible_pagination_enabled', false),
    bibleHeadingFontSize: LSN('bible_heading_font_size', 36),
    bibleHeadingFontColor: LS('bible_heading_font_color', '#ffffff'),
    bibleHeadingBgColor: LS('bible_heading_bg_color', '#0a0a0a'),
    bibleHeadingBgOpacity: LSN('bible_heading_bg_opacity', 60),
    bibleVerseFontSize: LSN('bible_verse_font_size', 56),
    bibleVerseFontColor: LS('bible_verse_font_color', '#fac105'),
    bibleVerseBgColor: LS('bible_verse_bg_color', '#050505'),
    bibleVerseBgOpacity: LSN('bible_verse_bg_opacity', 0),
  }));

  useEffect(() => {
    for (const [key, lsKey] of SAVE_KEYS) {
      const val = state[key];
      const strVal = typeof val === 'boolean' ? String(val) : String(val);
      try { localStorage.setItem(lsKey, strVal); } catch {}
    }
  }, [state]);

  const setValue = useCallback(<K extends keyof BibleStyleState>(key: K, value: BibleStyleState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const actions: BibleStyleActions = {
    setBiblePrimaryTranslation: v => setValue('biblePrimaryTranslation', v),
    setBibleReferenceTranslation: v => setValue('bibleReferenceTranslation', v),
    setBibleDescStyle: v => setValue('bibleDescStyle', v),
    setBibleDescSeparator: v => setValue('bibleDescSeparator', v),
    setBibleDescShowVersion: v => setValue('bibleDescShowVersion', v),
    setBibleDescAlignment: v => setValue('bibleDescAlignment', v),
    setBibleDescLineHeight: v => setValue('bibleDescLineHeight', v),
    setBibleDescPosition: v => setValue('bibleDescPosition', v),
    setBiblePaginationEnabled: v => setValue('biblePaginationEnabled', v),
    setBibleHeadingFontSize: v => setValue('bibleHeadingFontSize', v),
    setBibleHeadingFontColor: v => setValue('bibleHeadingFontColor', v),
    setBibleHeadingBgColor: v => setValue('bibleHeadingBgColor', v),
    setBibleHeadingBgOpacity: v => setValue('bibleHeadingBgOpacity', v),
    setBibleVerseFontSize: v => setValue('bibleVerseFontSize', v),
    setBibleVerseFontColor: v => setValue('bibleVerseFontColor', v),
    setBibleVerseBgColor: v => setValue('bibleVerseBgColor', v),
    setBibleVerseBgOpacity: v => setValue('bibleVerseBgOpacity', v),
  };

  const ctx: BibleStyleContextType = { ...state, ...actions };

  return React.createElement(BibleStyleContext.Provider, { value: ctx }, children);
}

export function useBibleStyle(): BibleStyleContextType {
  const ctx = useContext(BibleStyleContext);
  if (!ctx) throw new Error('useBibleStyle must be used within BibleStyleProvider');
  return ctx;
}
