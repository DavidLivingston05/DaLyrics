export interface Slide {
  id: string;
  label: string;
  text: string;
  notes?: string;
}

export type PresentationCategory = 'Song' | 'Scripture' | 'Announcements' | 'Sermon';

export type BackgroundType =
  | 'color' | 'gradient' | 'image' | 'video'
  | 'black' | 'white';

export type BackgroundTransition =
  | 'cut' | 'dissolve' | 'fadeBlack' | 'fadeWhite'
  | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown'
  | 'zoomIn' | 'zoomOut';

export interface ColorBackgroundConfig { color: string; opacity: number; }
export interface GradientBackgroundConfig { colors: string[]; angle: number; type: 'linear' | 'radial'; }
export interface ImageBackgroundConfig {
  filePath: string; fit: 'cover' | 'contain' | 'fill' | 'stretch';
  opacity: number; blur: number; brightness: number; contrast: number;
  saturation: number; hue: number; scale: number; positionX: number; positionY: number;
  grayscale: boolean; flipH: boolean; flipV: boolean;
}
export interface VideoBackgroundConfig {
  filePath: string; loop: boolean; muted: boolean; opacity: number;
  brightness: number; contrast: number; saturation: number; hue: number; blur: number;
  playbackRate: number; startTime: number; endTime: number | null;
  fit: 'cover' | 'contain' | 'fill'; chromaKey: string | null;
}

export type BackgroundConfig =
  | ColorBackgroundConfig
  | GradientBackgroundConfig
  | ImageBackgroundConfig
  | VideoBackgroundConfig;

export interface StyleSettings {
  fontFamily?: string;
  fontSizeScale?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  strokeEnabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  lineSpacing?: number;
  letterSpacing?: number;

  transitionType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'none';
  transitionDuration?: number;
  perWordAnimation?: boolean;
  loopAnimation?: 'none' | 'pulse' | 'float';

  arrangement?: string[];
  bilingualEnabled?: boolean;
  chordsEnabled?: boolean;

  lowerThirdMode?: 'none' | 'lyrics' | 'speaker' | 'ticker';
  speakerName?: string;
  speakerTitle?: string;
  tickerText?: string;
  tickerSpeed?: number;
  lowerThirdPosition?: 'bottom-10' | 'bottom-20' | 'custom';
  lowerThirdY?: number;
  lowerThirdBgColor?: string;
  lowerThirdBgOpacity?: number;
  lowerThirdBgBlur?: boolean;
  liveCaptionsEnabled?: boolean;

  bgType?: BackgroundType;
  bgConfig?: BackgroundConfig;
  bgTransition?: BackgroundTransition;
  bgTransitionDuration?: number;
  dimOverlay?: number;
}

export interface Presentation {
  id: string;
  title: string;
  category: PresentationCategory;
  slides: Slide[];
  copyright?: string;
  folder?: string;
  styleSettings?: StyleSettings;
}

export interface ParsedVerse {
  number: number;
  text: string;
}

export interface ParsedChapter {
  number: number;
  verses: ParsedVerse[];
}

export interface ParsedBook {
  number: number;
  name: string;
  abbreviation: string;
  testament: string;
  chapters: ParsedChapter[];
}

export interface OfflineBible {
  id: string;
  name: string;
  language: string;
  copyright: string;
  isDefault?: boolean;
  database: Record<string, string>;
  books: ParsedBook[];
}
