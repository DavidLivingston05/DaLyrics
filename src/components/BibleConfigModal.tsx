import React from 'react';
import { useBibleStyle } from '../contexts/BibleStyleContext';
import { BibleBookInfo } from '../lib/bibleMetadata';
import { Book, Settings, X } from 'lucide-react';

export type BibleLayoutId = 'standard' | 'versePrefix' | 'inlineRef' | 'bottomRef' | 'compact' | 'devotional';

interface BibleLayoutTemplate {
  id: BibleLayoutId;
  name: string;
  description: string;
  preview: string;
}

const BIBLE_LAYOUT_TEMPLATES: BibleLayoutTemplate[] = [
  { id: 'standard', name: 'Standard', description: 'Citation badge at top, verse text below', preview: 'Gen 1:1\nIn the beginning God created...' },
  { id: 'versePrefix', name: 'Verse Prefix', description: 'Chapter heading, verse number before each verse', preview: 'Genesis 1\n1 In the beginning...\n2 And the earth was...' },
  { id: 'inlineRef', name: 'Ref Inline', description: 'Book heading, chapter:verse prefix on each verse', preview: 'Genesis\n1:1 In the beginning...\n1:2 And the earth...' },
  { id: 'bottomRef', name: 'Bottom Ref', description: 'Verse text first, citation as a footer', preview: 'In the beginning God created...\n— Genesis 1:1' },
  { id: 'compact', name: 'Compact', description: 'Verse numbers only, no book/chapter citation', preview: '1 In the beginning...\n2 And the earth was...' },
  { id: 'devotional', name: 'Devotional', description: 'Clean text, minimal reference at bottom', preview: 'In the beginning God created...\n— Gen 1:1' },
];

interface BibleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBook: BibleBookInfo;
  activeChapter: number;
  primaryTranslation: string;
  setPrimaryTranslation: (v: string) => void;
  referenceTranslation: string;
  setReferenceTranslation: (v: string) => void;
  loadedBibles: { id: string; name: string; database: { [key: string]: string } }[];
  setLoadedBibles: React.Dispatch<React.SetStateAction<{ id: string; name: string; database: { [key: string]: string } }[]>>;
  xmlProgress: number | null;
  xmlError: string | null;
  handleXMLUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  configActiveTab: string;
  setConfigActiveTab: React.Dispatch<React.SetStateAction<string>>;
  bibleLayout: string;
  setBibleLayout: (v: any) => void;
  descStyle: string;
  setDescStyle: (v: string) => void;
  descSeparator: string;
  setDescSeparator: (v: string) => void;
  descPosition: string;
  setDescPosition: (v: string) => void;
  descShowVersion: boolean;
  setDescShowVersion: (v: boolean) => void;
  descLineHeight: number;
  setDescLineHeight: (v: number) => void;
  descAlignment: string;
  setDescAlignment: (v: string) => void;
  getTranslationLabel: (translation: string) => string;
  getVerseText: (book: BibleBookInfo, chapter: number, verse: number, translation: string) => string;
  deleteBibleFromDB: (id: string) => Promise<void>;
}

export default function BibleConfigModal({
  isOpen,
  onClose,
  activeBook,
  activeChapter,
  primaryTranslation,
  setPrimaryTranslation,
  referenceTranslation,
  setReferenceTranslation,
  loadedBibles,
  setLoadedBibles,
  xmlProgress,
  xmlError,
  handleXMLUpload,
  configActiveTab,
  setConfigActiveTab,
  bibleLayout,
  setBibleLayout,
  descStyle,
  setDescStyle,
  descSeparator,
  setDescSeparator,
  descPosition,
  setDescPosition,
  descShowVersion,
  setDescShowVersion,
  descLineHeight,
  setDescLineHeight,
  descAlignment,
  setDescAlignment,
  getTranslationLabel,
  getVerseText,
  deleteBibleFromDB,
}: BibleConfigModalProps) {
  const bs = useBibleStyle();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      id="bible-config-modal-overlay"
      onClick={() => onClose()}
    >
      <div
        className="bg-zinc-950 border border-zinc-850 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-upScale"
        onClick={(e) => e.stopPropagation()}
        id="bible-config-modal-container"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-450">
            <Settings className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-200">
              Bible Configuration
            </h3>
          </div>
          <button
            onClick={() => onClose()}
            className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header Tabs */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/40 divide-x divide-zinc-900/40 select-none">
          <button
            onClick={() => setConfigActiveTab('general')}
            className={`flex-1 py-3 text-[10px] font-sans font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
              configActiveTab === 'general'
                ? 'text-orange-400 bg-zinc-900/30 font-black border-b border-orange-500'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/10'
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setConfigActiveTab('verseDesc')}
            className={`flex-1 py-3 text-[10px] font-sans font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
              configActiveTab === 'verseDesc'
                ? 'text-orange-400 bg-zinc-900/30 font-black border-b border-orange-500'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/10'
            }`}
            id="tab-verse-description"
          >
            Verse Layout
          </button>
          <button
            onClick={() => setConfigActiveTab('typography')}
            className={`flex-1 py-3 text-[10px] font-sans font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
              configActiveTab === 'typography'
                ? 'text-orange-400 bg-zinc-900/30 font-black border-b border-orange-500'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/10'
            }`}
            id="tab-typography-styling"
          >
            Typographic Design
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-thin">
          {configActiveTab === 'general' ? (
            <div className="space-y-6 animate-fade-in">
              <p className="text-zinc-400 text-xs tracking-wide leading-relaxed">
                Configure XML Bible translations. Simply click below to ingest Zefania, EasySlides, or OpenLyrics formatted XML books to begin projecting.
              </p>

              {/* Translation Selects */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/20 p-4 border border-zinc-905 rounded-xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider">Primary Translation</label>
                  <select
                    value={primaryTranslation}
                    onChange={(e) => setPrimaryTranslation(e.target.value)}
                    className="w-full bg-zinc-905 text-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold border border-zinc-800 focus:outline-none focus:border-orange-500/80 cursor-pointer transition-colors"
                  >
                    <option value="NONE">None (Select XML Bible)</option>
                    {loadedBibles.map((bible) => (
                      <option key={bible.id} value={`xml-${bible.id}`}>
                        📖 {bible.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider">Reference Translation</label>
                  <select
                    value={referenceTranslation}
                    onChange={(e) => setReferenceTranslation(e.target.value)}
                    className="w-full bg-zinc-905 text-zinc-200 px-3 py-2 rounded-lg text-xs font-semibold border border-zinc-800 focus:outline-none focus:border-indigo-500/85 cursor-pointer transition-colors"
                  >
                    <option value="NONE">None (ஒன்றுமில்லை)</option>
                    {loadedBibles.map((bible) => (
                      <option key={bible.id} value={`xml-${bible.id}`}>
                        📖 {bible.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loaded Bibles Shelf List */}
              {loadedBibles.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest block font-bold">
                    Loaded XML Translations ({loadedBibles.length})
                  </label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {loadedBibles.map((bible) => {
                      const isPrimary = primaryTranslation === `xml-${bible.id}`;
                      const isRef = referenceTranslation === `xml-${bible.id}`;
                      return (
                        <div
                          key={bible.id}
                          className="flex items-center justify-between bg-zinc-900 border border-zinc-850 p-3 rounded-xl text-xs gap-2"
                        >
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-zinc-200 font-bold truncate max-w-[170px]" title={bible.name}>
                              {bible.name}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                              {Object.keys(bible.database).length.toLocaleString()} verses mounted
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isPrimary && (
                              <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Primary</span>
                            )}
                            {isRef && (
                              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Ref</span>
                            )}
                            <button
                              onClick={() => {
                                deleteBibleFromDB(bible.id);
                                setLoadedBibles(prev => prev.filter(b => b.id !== bible.id));
                                if (primaryTranslation === `xml-${bible.id}`) {
                                  setPrimaryTranslation('NONE');
                                }
                                if (referenceTranslation === `xml-${bible.id}`) {
                                  setReferenceTranslation('NONE');
                                }
                              }}
                              className="text-red-400 hover:text-red-350 hover:bg-red-950/40 font-mono text-[9px] font-extrabold px-2 py-1 rounded-lg transition-colors border border-red-955/20 cursor-pointer"
                            >
                              Unload
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* XML Ingest Sector */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest block font-bold">
                  Ingest XML Bible File (Multi-deck loader)
                </label>
                <div className="bg-zinc-900/40 p-4 border border-dashed border-zinc-850 hover:border-orange-500/50 hover:bg-zinc-900/60 rounded-xl transition-all relative flex flex-col items-center justify-center text-center">
                  {xmlProgress !== null ? (
                    <div className="w-full py-2">
                      <div className="flex justify-between text-[10px] text-zinc-300 font-mono mb-2 font-bold animate-pulse">
                        <span>PARSING XML BIBLE DECK...</span>
                        <span>{xmlProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-1.5 rounded overflow-hidden shadow-inner">
                        <div className="bg-orange-500 h-full transition-all duration-150" style={{ width: `${xmlProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer group flex flex-col items-center justify-center w-full py-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-850 group-hover:border-orange-500/55 transition-colors mb-2.5">
                        <Book className="w-5 h-5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-orange-400 transition-colors font-sans">
                        Click to ingest additional XML Bible
                      </span>
                      <span className="text-[10px] text-zinc-650 font-mono mt-1 select-none">
                        XML files formatted for Zefania, EasySlides, or OpenLyrics matchers
                      </span>
                      {xmlError && (
                        <div className="text-[10px] text-red-400 font-mono mt-2 font-bold max-w-xs leading-normal">
                          ⚠️ {xmlError}
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".xml"
                        onChange={handleXMLUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ) : configActiveTab === 'verseDesc' ? (
            <div className="space-y-5 animate-fade-in">
              <p className="text-zinc-400 text-xs tracking-wide leading-relaxed">
                Personalize how the book citation, chapter numbers, and passage verses are formatted and positioned on the projected screen.
              </p>

              {/* Layout Template Selector */}
              <div className="bg-zinc-900/10 p-3 rounded-xl border border-zinc-900/60 space-y-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Layout Template</span>
                <div className="grid grid-cols-3 gap-2">
                  {BIBLE_LAYOUT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setBibleLayout(tpl.id)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        bibleLayout === tpl.id
                          ? 'border-orange-500 bg-orange-500/10 shadow-sm shadow-orange-500/10'
                          : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-900/30'
                      }`}
                    >
                      <span className={`block text-[10px] font-mono font-bold leading-tight ${
                        bibleLayout === tpl.id ? 'text-orange-400' : 'text-zinc-300'
                      }`}>{tpl.name}</span>
                      <span className="block text-[9px] text-zinc-500 font-sans leading-tight pt-0.5">{tpl.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-zinc-900/10 p-4 rounded-xl border border-zinc-900/60">
                {/* Style format */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Description Format</span>
                  </div>
                  <select
                    value={descStyle}
                    onChange={(e) => setDescStyle(e.target.value)}
                    className="bg-zinc-900 text-zinc-205 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value="bilingual">ஆதியாகமம் (Genesis) 1:1</option>
                    <option value="tamil">ஆதியாகமம் 1:1 (Tamil Only)</option>
                    <option value="english">Genesis 1:1 (English Only)</option>
                    <option value="abbr">Gen 1:1 (Abbreviation)</option>
                  </select>
                </div>

                {/* Separator */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Separator Notations</span>
                  </div>
                  <select
                    value={descSeparator}
                    onChange={(e) => setDescSeparator(e.target.value)}
                    className="bg-zinc-900 text-zinc-205 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value=":">Colon (e.g. 1:1)</option>
                    <option value=".">Dot (e.g. 1.1)</option>
                    <option value=" ">Space (e.g. 1 1)</option>
                    <option value="-">Hyphen (e.g. 1-1)</option>
                  </select>
                </div>

                {/* Position */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Display Position</span>
                  </div>
                  <select
                    value={descPosition}
                    onChange={(e) => setDescPosition(e.target.value)}
                    className="bg-zinc-900 text-zinc-205 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value="top_separate">Top Header (Separate)</option>
                    <option value="bottom_separate">Bottom Footer (Separate)</option>
                    <option value="beginning">Beginning of Verse</option>
                    <option value="end">End of Verse</option>
                    <option value="top_line">Separate line at Top</option>
                    <option value="bottom_line">Separate line at Bottom</option>
                    <option value="hidden">Do not show (Hidden)</option>
                  </select>
                </div>

                {/* Show Version */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Show Translation name</span>
                  </div>
                  <select
                    value={descShowVersion ? 'true' : 'false'}
                    onChange={(e) => setDescShowVersion(e.target.value === 'true')}
                    className="bg-zinc-905 text-zinc-205 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-800 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Line height */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Line spacing padding</span>
                  </div>
                  <select
                    value={descLineHeight}
                    onChange={(e) => setDescLineHeight(parseInt(e.target.value, 10))}
                    className="bg-zinc-900 text-zinc-205 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value="4">4%</option>
                    <option value="6">6%</option>
                    <option value="8">8% (Default)</option>
                    <option value="10">10%</option>
                    <option value="12">12%</option>
                    <option value="16">16%</option>
                  </select>
                </div>

                {/* Horizontal Alignment */}
                <div className="flex items-center justify-between gap-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-zinc-300 font-sans">Horizontal Alignment</span>
                  </div>
                  <select
                    value={descAlignment}
                    onChange={(e) => setDescAlignment(e.target.value)}
                    className="bg-zinc-900 text-zinc-250 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 focus:outline-none focus:border-orange-500/80 cursor-pointer min-w-[160px]"
                  >
                    <option value="inherited">Inherited (Default)</option>
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              {/* Aesthetic configuration preview banner */}
              <div className="p-4 bg-orange-500/5 text-orange-400 border border-orange-500/10 rounded-xl space-y-1 text-center font-mono">
                <span className="text-[9.5px] font-black uppercase tracking-widest block text-zinc-400">Format Live Preview</span>
                <p className="text-[11px] font-sans font-medium whitespace-pre-line leading-relaxed italic text-zinc-300 pt-1">
                  {descPosition === 'top_separate' || descPosition === 'bottom_separate' ? (
                    <>
                      <span className="text-orange-400 font-bold block pb-1">Slide Footer/Header label:</span>
                      "{descStyle === 'bilingual' ? `${activeBook.tamil} (${activeBook.english})` : descStyle === 'tamil' ? activeBook.tamil : activeBook.english} {activeChapter}{descSeparator}1{descShowVersion ? ` [${getTranslationLabel(primaryTranslation)}]` : ''}"
                    </>
                  ) : descPosition === 'beginning' ? (
                    `"[${descStyle === 'bilingual' ? `${activeBook.tamil} (${activeBook.english})` : descStyle === 'tamil' ? activeBook.tamil : activeBook.english} {activeChapter}{descSeparator}1${descShowVersion ? ` [${getTranslationLabel(primaryTranslation)}]` : ''}] - ${getVerseText(activeBook, activeChapter, 1, primaryTranslation).substring(0, 50)}..."`
                  ) : descPosition === 'end' ? (
                    `"${getVerseText(activeBook, activeChapter, 1, primaryTranslation).substring(0, 50)}... (${descStyle === 'bilingual' ? `${activeBook.tamil} (${activeBook.english})` : descStyle === 'tamil' ? activeBook.tamil : activeBook.english} {activeChapter}{descSeparator}1${descShowVersion ? ` [${getTranslationLabel(primaryTranslation)}]` : ''})"`
                  ) : descPosition === 'top_line' ? (
                    `"${descStyle === 'bilingual' ? `${activeBook.tamil} (${activeBook.english})` : descStyle === 'tamil' ? activeBook.tamil : activeBook.english} {activeChapter}{descSeparator}1${descShowVersion ? ` [${getTranslationLabel(primaryTranslation)}]` : ''}\n${getVerseText(activeBook, activeChapter, 1, primaryTranslation).substring(0, 50)}..."`
                  ) : descPosition === 'bottom_line' ? (
                    `"${getVerseText(activeBook, activeChapter, 1, primaryTranslation).substring(0, 50)}...\n${descStyle === 'bilingual' ? `${activeBook.tamil} (${activeBook.english})` : descStyle === 'tamil' ? activeBook.tamil : activeBook.english} {activeChapter}{descSeparator}1${descShowVersion ? ` [${getTranslationLabel(primaryTranslation)}]` : ''}"`
                  ) : (
                    `"${getVerseText(activeBook, activeChapter, 1, primaryTranslation).substring(0, 50)}..."`
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* TYPOGRAPHIC DESIGN TAB */
            <div className="space-y-6 animate-fade-in text-sans select-none">
              <p className="text-zinc-400 text-xs tracking-wide leading-relaxed">
                Personalize fonts, text sizes, background sheets, and opacity levels for both citation headings and scriptures.
              </p>

              {/* CARD 1: TOP HEADING STYLING */}
              <div className="bg-zinc-900/25 p-4 border border-zinc-900 rounded-2xl space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-2 mb-2">
                  <div className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                  <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Top Heading (Citation)</h4>
                </div>

                {/* Font Size Selector */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-sans">Font Size</span>
                    <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bs.bibleHeadingFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    step="1"
                    value={bs.bibleHeadingFontSize}
                    onChange={(e) => bs.setBibleHeadingFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Text Color / Bg Color Color Pickers Side by Side */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Text Color */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Text Color</span>
                    <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                      <input
                        type="color"
                        value={bs.bibleHeadingFontColor}
                        onChange={(e) => bs.setBibleHeadingFontColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] font-mono text-zinc-350">{bs.bibleHeadingFontColor}</span>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Background Color</span>
                    <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                      <input
                        type="color"
                        value={bs.bibleHeadingBgColor}
                        onChange={(e) => bs.setBibleHeadingBgColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] font-mono text-zinc-350">{bs.bibleHeadingBgColor}</span>
                    </div>
                  </div>
                </div>

                {/* Background Opacity */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-sans">Background Opacity</span>
                    <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bs.bibleHeadingBgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bs.bibleHeadingBgOpacity}
                    onChange={(e) => bs.setBibleHeadingBgOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>

              {/* CARD 2: MAIN VERSE TEXT STYLING */}
              <div className="bg-zinc-900/25 p-4 border border-zinc-900 rounded-2xl space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-2 mb-2">
                  <div className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                  <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Main Verse Text</h4>
                </div>

                {/* Font Size Selector */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-sans">Font Size</span>
                    <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bs.bibleVerseFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    step="1"
                    value={bs.bibleVerseFontSize}
                    onChange={(e) => bs.setBibleVerseFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Text Color / Bg Color Color Pickers Side by Side */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Text Color */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Text Color</span>
                    <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                      <input
                        type="color"
                        value={bs.bibleVerseFontColor}
                        onChange={(e) => bs.setBibleVerseFontColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] font-mono text-zinc-350">{bs.bibleVerseFontColor}</span>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Background Color</span>
                    <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                      <input
                        type="color"
                        value={bs.bibleVerseBgColor}
                        onChange={(e) => bs.setBibleVerseBgColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] font-mono text-zinc-350">{bs.bibleVerseBgColor}</span>
                    </div>
                  </div>
                </div>

                {/* Background Opacity */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-sans">Background Opacity</span>
                    <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bs.bibleVerseBgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bs.bibleVerseBgOpacity}
                    onChange={(e) => bs.setBibleVerseBgOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-zinc-900 bg-zinc-900/20 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => onClose()}
            className="bg-orange-500 hover:bg-orange-600 text-black border-0 font-sans text-xs font-extrabold uppercase px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            id="bible-config-save-btn"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
