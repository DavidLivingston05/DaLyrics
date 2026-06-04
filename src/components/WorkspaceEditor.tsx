import { useMemo, useState, useEffect } from 'react';
import { Presentation, Slide, OfflineBible } from '../types';
import { LayoutGrid, FileText, Tv, Check, Play, FileEdit, Info, Sliders, BookOpen } from 'lucide-react';
import { loadBiblesFromDB } from '../lib/db';
import { BIBLE_BOOKS_METADATA } from '../lib/bibleMetadata';
import { ALIAS_MAP } from '../constants/bibleAliases';

interface WorkspaceEditorProps {
  activePresentation: Presentation | null;
  activeSlideIndex: number | null;
  onSelectSlideIndex: (index: number) => void;
  onUpdatePresentation: (updated: Presentation) => void;
  liveCaptionText: string;
  onUpdateLiveCaptionText: (text: string) => void;}

export default function WorkspaceEditor({
  activePresentation,
  activeSlideIndex,
  onSelectSlideIndex,
  onUpdatePresentation,
  liveCaptionText,
  onUpdateLiveCaptionText
}: WorkspaceEditorProps) {

  // Toggle state between 'present' (Slides grid, default), 'edit' (plain text editor), and 'style' (styles designer)
  const [editorMode, setEditorMode] = useState<'present' | 'edit' | 'style'>('present');
  const [stylePanelTab, setStylePanelTab] = useState<'font' | 'transitions' | 'effects' | 'spacing' | 'layout' | 'background'>('font');

  // Quick Scripture Modal state
  const [bibles, setBibles] = useState<OfflineBible[]>([]);
  const [showScriptureModal, setShowScriptureModal] = useState(false);
  const [selectedBibleId, setSelectedBibleId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('GEN');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerseStart, setSelectedVerseStart] = useState(1);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState(1);
  const [scriptureSplitMode, setScriptureSplitMode] = useState<'single' | 'split'>('single');

  // Fast Search states
  const [fastSearchQuery, setFastSearchQuery] = useState('');
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const filteredBiblesBooks = useMemo(() => {
    const q = fastSearchQuery.trim().toLowerCase();
    if (!q) return [];
    
    return BIBLE_BOOKS_METADATA.filter(book => {
      const eng = book.english.toLowerCase();
      const tam = book.tamil;
      const idMatches = book.id.toLowerCase().startsWith(q);
      
      const aliases = Object.keys(ALIAS_MAP).filter(k => ALIAS_MAP[k].number === book.bookNumber);
      const aliasMatches = aliases.some(alias => alias.startsWith(q));

      return eng.startsWith(q) || tam.includes(q) || idMatches || aliasMatches;
    });
  }, [fastSearchQuery]);

  useEffect(() => {
    if (showScriptureModal) {
      setFastSearchQuery('');
      setActiveSuggestionIndex(0);
      
      setTimeout(() => {
        document.getElementById('quick-book-search-input')?.focus();
      }, 100);
    }
  }, [showScriptureModal]);

  useEffect(() => {
    let active = true;
    loadBiblesFromDB().then((data) => {
      if (!active) return;
      if (data && data.length > 0) {
        setBibles(data);
        setSelectedBibleId(data[0].id);
      }
    });
    return () => { active = false; };
  }, []);

  // Resolves chapter count constraints
  const activeBookInfo = BIBLE_BOOKS_METADATA.find(b => b.id === selectedBookId);
  const maxChapters = activeBookInfo?.chaptersCount || 50;

  // Respect custom arrangement order
  const displaySlides = useMemo(() => {
    if (!activePresentation) return [];
    const arrangement = activePresentation.styleSettings?.arrangement;
    if (arrangement && arrangement.length > 0) {
      return arrangement.map((label, arrIdx) => {
        const originalSlide = activePresentation.slides.find(
          (s) => s.label.toLowerCase() === label.toLowerCase()
        );
        return {
          id: `arranged-${arrIdx}-${originalSlide?.id || 'missing'}`,
          label,
          text: originalSlide ? originalSlide.text : `[Slide Label Not Found: ${label}]`,
          index: arrIdx
        };
      });
    }
    return activePresentation.slides.map((slide, idx) => ({
      id: slide.id,
      label: slide.label,
      text: slide.text,
      index: idx
    }));
  }, [activePresentation?.slides, activePresentation?.styleSettings?.arrangement]);

  // Strip chords when disabled
  const displayCardText = (textStr: string) => {
    const chordsEnabled = !!activePresentation?.styleSettings?.chordsEnabled;
    if (chordsEnabled) return textStr;
    return textStr ? textStr.replace(/\[[A-G][b#]?(?:[^\s\]]*)\]/g, '').replace(/[^\S\r\n]+/g, ' ').trim() : '';
  };

  const rawText = useMemo(() => {
    if (!activePresentation) return '';
    return activePresentation.slides.map((s) => {
      const isGeneric = /^slide\s+\d+$/i.test(s.label);
      if (isGeneric) {
        return s.text;
      } else {
        return `[${s.label}]\n${s.text}`;
      }
    }).join('\n\n');
  }, [activePresentation?.id, activePresentation?.slides]);

  const handleTextChange = (text: string) => {
    if (!activePresentation) return;

    const blocks = text.split(/\n\s*\n+/);
    
    const parsedSlides: Slide[] = blocks.map((block, idx) => {
      const lines = block.split('\n');
      if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        return null;
      }

      let label = `Slide ${idx + 1}`;
      let slideText = block.trim();

      const firstLine = lines[0].trim();
      const bracketMatch = firstLine.match(/^\[(.*)\]$/);
      const isCommonLabel = /^(verse|chorus|bridge|intro|ending|outro|tag|slide|praise|welcome|refrain|blank|pre-chorus|interlude|chorus\s+\d+|verse\s+\d+)(\s+\d+)?$/i.test(firstLine);

      if (bracketMatch) {
         label = bracketMatch[1].trim();
        slideText = lines.slice(1).join('\n').trim();
      } else if (isCommonLabel) {
        label = firstLine;
        slideText = lines.slice(1).join('\n').trim();
      }

      return {
        id: `slide-parsed-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label,
        text: slideText
      };
    }).filter((s): s is Slide => s !== null);

    const finalSlides = parsedSlides.length > 0 ? parsedSlides : [{
      id: `slide-empty-${Date.now()}`,
      label: 'Slide 1',
      text: ''
    }];

    onUpdatePresentation({
      ...activePresentation,
      slides: finalSlides
    });
  };

  const handleInsertScripture = () => {
    const bible = bibles.find(b => b.id === selectedBibleId);
    if (!bible) return;

    const book = BIBLE_BOOKS_METADATA.find(b => b.id === selectedBookId);
    const bookName = book ? book.english : selectedBookId;

    let appendedText = '';
    const versesToInsert: { verse: number; text: string }[] = [];

    for (let v = selectedVerseStart; v <= selectedVerseEnd; v++) {
      const key = `${selectedBookId}.${selectedChapter}.${v}`;
      const textVal = bible.database[key];
      if (textVal) {
        versesToInsert.push({ verse: v, text: textVal.trim() });
      }
    }

    if (versesToInsert.length === 0) {
      alert('No verses found in the database for the selected range.');
      return;
    }

    if (scriptureSplitMode === 'single') {
      const label = `${bookName} ${selectedChapter}:${selectedVerseStart}${selectedVerseEnd > selectedVerseStart ? `-${selectedVerseEnd}` : ''}`;
      const content = versesToInsert.map(item => `${versesToInsert.length > 1 ? `${item.verse} ` : ''}${item.text}`).join('\n');
      appendedText = `\n\n[${label}]\n${content}`;
    } else {
      appendedText = versesToInsert.map(item => {
        const label = `${bookName} ${selectedChapter}:${item.verse}`;
        return `\n\n[${label}]\n${item.text}`;
      }).join('');
    }

    const newRawText = rawText ? `${rawText}${appendedText}` : appendedText.trim();
    handleTextChange(newRawText);
    setShowScriptureModal(false);
  };

  if (!activePresentation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-500 text-center select-none" id="workspace-editor-empty">
        <LayoutGrid className="w-12 h-12 stroke-[1] mb-3 text-zinc-700 animate-pulse animate-duration-2000" />
        <h3 className="text-sm font-medium text-zinc-400">No Item Selected</h3>
        <p className="text-[11px] text-zinc-650 max-w-xs mt-1">
          Select an item from the library on the left, or create a new one to begin editing and presenting.
        </p>
      </div>
    );
  }

  const getHeaderBadgeStyle = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('chorus') || l.includes('பல்லவி')) {
      return {
        bg: 'bg-cyan-950/85 border-cyan-800/40 text-cyan-400',
        dot: 'bg-cyan-400 animate-pulse'
      };
    }
    if (l.includes('verse') || l.includes('சரணம்')) {
      return {
        bg: 'bg-emerald-950/85 border-emerald-800/40 text-emerald-400',
        dot: 'bg-emerald-400 animate-pulse'
      };
    }
    if (l.includes('bridge') || l.includes('அனுபல்லவி')) {
      return {
        bg: 'bg-purple-950/85 border-purple-800/40 text-purple-400',
        dot: 'bg-purple-400 animate-pulse'
      };
    }
    if (l.includes('intro') || l.includes('title') || l.includes('வரவேற்பு')) {
      return {
        bg: 'bg-amber-950/85 border-amber-850 text-amber-400',
        dot: 'bg-amber-400 animate-pulse'
      };
    }
    if (l.includes('ending') || l.includes('outro') || l.includes('முடிவு')) {
      return {
        bg: 'bg-rose-950/85 border-rose-800/40 text-rose-400',
        dot: 'bg-rose-400 animate-pulse'
      };
    }
    return {
      bg: 'bg-zinc-900 border-zinc-800 text-zinc-300',
      dot: 'bg-zinc-500'
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-zinc-950" id="center-column">
      
      <div className="px-5 py-3 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-base font-semibold text-zinc-200 truncate">
            {activePresentation.title}
          </h1>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/60">{activePresentation.slides.length} slides</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowScriptureModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-855"
            title="Insert Quick Scripture slides"
          >
            <BookOpen className="w-4 h-4 text-orange-450" />
            <span>+ Scripture</span>
          </button>

          <div className="flex bg-black/45 p-1 rounded-xl border border-zinc-900/80">
            <button
              type="button"
              onClick={() => setEditorMode('present')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                editorMode === 'present'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-black shadow-inner shadow-emerald-950/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
              title="Present Slides Mode"
            >
              <Tv className="w-4 h-4" />
              <span>Present</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('edit')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                editorMode === 'edit'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15 font-black shadow-inner shadow-amber-950/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
              title="Edit Plain Text Mode"
            >
              <FileEdit className="w-4 h-4" />
              <span>Edit Lyrics</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('style')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                editorMode === 'style'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15 font-black shadow-inner shadow-orange-950/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
              title="Style Designer Mode"
            >
              <Sliders className="w-4 h-4" />
              <span>Style Designer</span>
            </button>
          </div>
        </div>
      </div>

      {editorMode === 'present' ? (
        
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 animate-fade-in">
          
          <div className="flex-1 overflow-y-auto p-5" id="slide-cards-workspace-grid">
            {displaySlides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none text-zinc-500">
                <Info className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-xs">No slides found in this catalog.</p>
                <button
                  type="button"
                  onClick={() => setEditorMode('edit')}
                  className="mt-3 bg-zinc-905 hover:bg-zinc-850 text-zinc-300 text-xs px-3 py-1.5 border border-zinc-800 rounded-lg cursor-pointer"
                >
                  Write Plain Lyrics
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {displaySlides.map((slide, index) => {
                  const isLive = activeSlideIndex === index;
                  const badge = getHeaderBadgeStyle(slide.label);
                  const linesCount = displayCardText(slide.text).split('\n').filter(line => line.trim().length > 0).length;
                  
                  return (
                    <div
                      key={slide.id + '-' + index}
                      onClick={() => onSelectSlideIndex(index)}
                      className={`rounded-2xl border flex flex-col justify-between transition-all duration-300 overflow-hidden relative group cursor-pointer ${
                        isLive
                          ? 'bg-zinc-900 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-950/30 scale-[1.01]'
                          : 'bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900 hover:border-zinc-750 text-zinc-400 shadow-md hover:shadow-xl active:scale-[0.995]'
                      }`}
                      id={`slide-card-${index}`}
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between uppercase tracking-wider select-none shrink-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`px-3 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {slide.label}
                          </span>
                          {linesCount > 4 && (
                            <span className="text-[8.5px] font-mono text-amber-500 bg-amber-950/60 border border-amber-500/25 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5 animate-pulse shrink-0" title="Lyric line safety limit warned: This slide has more than 4 lines of text. We recommend keeping slides under 4 lines for optimal readability.">
                              ⚠️ {linesCount} Lines
                            </span>
                          )}
                        </div>
                        <span className={`font-mono text-[9px] font-bold ${isLive ? 'text-emerald-400' : 'text-zinc-600'}`}>#{index + 1}</span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-center text-center bg-black/10 min-h-[100px]">
                        <p className={`text-xs sm:text-sm md:text-[14px] font-medium font-sans tracking-wide leading-relaxed whitespace-pre-line px-2 transition-colors ${
                          isLive ? 'text-white font-bold' : 'text-zinc-300 font-normal group-hover:text-zinc-150'
                        }`}>
                          {displayCardText(slide.text)}
                        </p>
                      </div>

                      <div className="px-4 py-2.5 bg-zinc-950/30 border-t border-zinc-900/50 flex items-center justify-between shrink-0 select-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSlideIndex(index);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            isLive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-950/20'
                          }`}
                        >
                          {isLive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                              <span className="font-extrabold">Active Live</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-zinc-500 group-hover:text-emerald-200 transition-colors shrink-0" />
                              <span>Go Live</span>
                            </>
                          )}
                        </button>
                        <span className="text-[9.5px] font-mono text-zinc-600 uppercase">Slide {index + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : editorMode === 'edit' ? (
        
        /* Edit Mode */
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 p-5 gap-4 animate-fade-in">
          
          {/* Editor hint */}
          <div className="bg-amber-950/15 border border-amber-900/30 rounded-2xl p-4 flex gap-3 text-sans text-xs text-amber-300 leading-normal shrink-0">
            <Info className="w-5 h-5 text-amber-500 shrink-0 self-start mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-200">Lyrics Auto-slide Editor</p>
              <p className="text-zinc-400 text-[11px]">
                We compile your raw text blocks instantly based on spacing. Leaving a <span className="text-amber-400 font-bold">blank line</span> splits text into separate slides. Label slides by starting a line with bracket notations like <span className="text-amber-400 font-extrabold">[Verse 1]</span> or common keywords.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute top-3.5 right-4 z-10 text-[9px] font-mono text-zinc-600 uppercase pointer-events-none tracking-wider flex items-center gap-1.5 bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-zinc-900">
              <FileText className="w-3.5 h-3.5" />
              <span>Full Raw Text Workspace</span>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Type or paste lyrics or presentation text here. Double-space to generate slide cards.\n\nExample:\n\n[Verse 1]\nAmazing grace! How sweet the sound\nThat saved a wretch like me!\n\n[Chorus]\nMy chains are gone, I've been set free\nMy Savior, Ransom, has ransomed me\n\n[Verse 2]\n'Twas grace that taught my heart to fear`}
              className="w-full h-full flex-1 bg-zinc-950 text-sm text-zinc-200 p-5 focus:outline-none placeholder-zinc-750 font-sans leading-relaxed resize-none border border-zinc-900 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 rounded-2xl transition-all shadow-inner custom-scrollbar"
              id="workspace-raw-editor"
            />
          </div>

          {/* Metrics */}
          <div className="bg-zinc-900/10 border border-zinc-900 py-3.5 px-4.5 rounded-2xl shrink-0 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-400">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-zinc-650">Characters:</span>
                <span className="text-zinc-200 font-bold">{rawText.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-650">Words:</span>
                <span className="text-zinc-200 font-bold">
                  {rawText.split(/\s+/).filter(Boolean).length.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 border-l border-zinc-900 pl-5">
                <span className="text-zinc-650">Compiled Deck:</span>
                <span className="text-amber-450 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block" />
                  {activePresentation.slides.length} Slides
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditorMode('present')}
              className="bg-amber-600 hover:bg-amber-550 text-white hover:brightness-105 active:scale-95 text-xs font-sans font-extrabold px-4 py-2 border-0 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-lg shadow-amber-950/20 uppercase tracking-wider"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Save & View Slides</span>
            </button>
          </div>

        </div>
      ) : (
        /* Style Mode */
        <div className="flex-1 flex flex-col min-h-0 bg-neutral-950 p-5 gap-4 animate-fade-in overflow-y-auto custom-scrollbar">
          <div className="flex border-b border-zinc-900 gap-4 shrink-0 pb-1.5 select-none">
            <button
              onClick={() => setStylePanelTab('font')}
              className={`pb-2 text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                stylePanelTab === 'font' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Typography
            </button>
            <button
              onClick={() => setStylePanelTab('transitions')}
              className={`pb-2 text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                stylePanelTab === 'transitions' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Transitions
            </button>
            <button
              onClick={() => setStylePanelTab('effects')}
              className={`pb-2 text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                stylePanelTab === 'effects' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Effects & Outlines
            </button>
            <button
              onClick={() => setStylePanelTab('spacing')}
              className={`pb-2 text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                stylePanelTab === 'spacing' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Line & Kerning
            </button>
            <button
              onClick={() => setStylePanelTab('layout')}
              className={`pb-2 text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                stylePanelTab === 'layout' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Layout & Arrangement
            </button>
          </div>

          <div className="flex-1 space-y-5 max-w-2xl w-full">
            {stylePanelTab === 'font' && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Font Family</label>
                  <select
                    value={activePresentation.styleSettings?.fontFamily || 'system-ui'}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, fontFamily: e.target.value } });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition-all font-sans"
                  >
                    <option value="system-ui">System UI (Clean default)</option>
                    <option value="Arial">Arial (Sleek sans-serif)</option>
                    <option value="Georgia">Georgia (Traditional serif)</option>
                    <option value="Impact">Impact (Heavy outline style)</option>
                    <option value="Montserrat">Montserrat (Modern elegant)</option>
                    <option value="Playfair Display">Playfair Display (Beautiful serif)</option>
                    <option value="monospace">Courier Mono (Tactile coding)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Stage Font Scale</label>
                    <span className="text-xs font-mono text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                      {activePresentation.styleSettings?.fontSizeScale || 1.0}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={activePresentation.styleSettings?.fontSizeScale || 1.0}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, fontSizeScale: parseFloat(e.target.value) } });
                    }}
                    className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                  />
                  <p className="text-[9px] text-zinc-550 italic leading-relaxed">
                    Scales the baseline auto-fit sizing on the TV screen. Helps make text slightly larger or smaller.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1.5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold font-bold">Alignment</label>
                    <div className="flex bg-black/45 p-1 rounded-xl border border-zinc-900">
                      {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, alignment: align } });
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-center font-sans font-bold capitalize select-none ${
                            (activePresentation.styleSettings?.alignment || 'center') === align
                              ? 'bg-zinc-800 text-orange-400 border border-zinc-700/60'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Color Theme</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activePresentation.styleSettings?.color || '#ffffff'}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, color: e.target.value } });
                        }}
                        className="w-10 h-9 rounded-lg border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={(activePresentation.styleSettings?.color || '#ffffff').toUpperCase()}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, color: e.target.value } });
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-805 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500/60 uppercase font-mono"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Style Format</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const ss = activePresentation.styleSettings || {};
                        onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, bold: !ss.bold } });
                      }}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
                        activePresentation.styleSettings?.bold 
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
                          : 'bg-zinc-905 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Bold
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ss = activePresentation.styleSettings || {};
                        onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, italic: !ss.italic } });
                      }}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
                        activePresentation.styleSettings?.italic 
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
                          : 'bg-zinc-905 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Italic
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ss = activePresentation.styleSettings || {};
                        onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, underline: !ss.underline } });
                      }}
                      className={`flex-1 py-2 px-3 border rounded-xl text-xs font-sans font-bold transition-all cursor-pointer ${
                        activePresentation.styleSettings?.underline 
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' 
                          : 'bg-zinc-905 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Underline
                    </button>
                  </div>
                </div>
              </div>
            )}

            {stylePanelTab === 'transitions' && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Slide Transition</label>
                  <select
                    value={activePresentation.styleSettings?.transitionType || 'fade'}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, transitionType: e.target.value as any } });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition-all font-sans"
                  >
                    <option value="fade">Fade In / Fade Out (Smooth opacity)</option>
                    <option value="slide-up">Slide Up (Smooth entrance from bottom)</option>
                    <option value="slide-down">Slide Down (Smooth entrance from top)</option>
                    <option value="slide-left">Slide Left (Smooth entrance from right)</option>
                    <option value="slide-right">Slide Right (Smooth entrance from left)</option>
                    <option value="none">Instant / None (Direct cut)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Transition Duration</label>
                    <span className="text-xs font-mono text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                      {activePresentation.styleSettings?.transitionDuration || 0.6}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.1"
                    value={activePresentation.styleSettings?.transitionDuration || 0.6}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, transitionDuration: parseFloat(e.target.value) } });
                    }}
                    className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                  />
                  <p className="text-[9px] text-zinc-550 italic leading-relaxed">
                    Set how long the entrance and exit transition animation plays on the TV display.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-3 pt-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Stagger Per-Word Animation</span>
                      <span className="text-[9px] text-zinc-500 leading-normal font-sans pt-0.5">Staggers the entrance of each lyric word for custom cinematic emphasis.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePresentation.styleSettings?.perWordAnimation}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, perWordAnimation: e.target.checked } });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white" />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Continuous Loop Animation</label>
                  <select
                    value={activePresentation.styleSettings?.loopAnimation || 'none'}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, loopAnimation: e.target.value as any } });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition-all font-sans"
                  >
                    <option value="none">Instant / None (Standard display)</option>
                    <option value="pulse">Pulse Glow (Continuously pulses scale and opacity)</option>
                    <option value="float">Floating Motion (Continuously floats the text up/down)</option>
                  </select>
                  <p className="text-[9px] text-zinc-550 italic leading-relaxed">
                    Continuously animates the slide text on stage. Perfect for pulsing title slides or floating lyrics.
                  </p>
                </div>
              </div>
            )}

            {stylePanelTab === 'effects' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Text Shadow</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePresentation.styleSettings?.shadowEnabled}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, shadowEnabled: e.target.checked } });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white" />
                    </label>
                  </div>

                  {activePresentation.styleSettings?.shadowEnabled && (
                    <div className="space-y-4 animate-fade-in pt-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Offset X ({activePresentation.styleSettings?.shadowX ?? 2}px)</span>
                          <input
                            type="range"
                            min="-15"
                            max="15"
                            value={activePresentation.styleSettings?.shadowX ?? 2}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, shadowX: parseInt(e.target.value) } });
                            }}
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Offset Y ({activePresentation.styleSettings?.shadowY ?? 2}px)</span>
                          <input
                            type="range"
                            min="-15"
                            max="15"
                            value={activePresentation.styleSettings?.shadowY ?? 2}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, shadowY: parseInt(e.target.value) } });
                            }}
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Blur Radius ({activePresentation.styleSettings?.shadowBlur ?? 4}px)</span>
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={activePresentation.styleSettings?.shadowBlur ?? 4}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, shadowBlur: parseInt(e.target.value) } });
                            }}
                            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Shadow Color</span>
                          <input
                            type="color"
                            value={activePresentation.styleSettings?.shadowColor || '#000000'}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, shadowColor: e.target.value } });
                            }}
                            className="w-full h-7 rounded-lg border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Text Stroke / Outline</h3>
                    </div>
                    <label className="relative inline-flex inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePresentation.styleSettings?.strokeEnabled}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, strokeEnabled: e.target.checked } });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white" />
                    </label>
                  </div>

                  {activePresentation.styleSettings?.strokeEnabled && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Stroke Width ({activePresentation.styleSettings?.strokeWidth ?? 2}px)</span>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={activePresentation.styleSettings?.strokeWidth ?? 2}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, strokeWidth: parseInt(e.target.value) } });
                          }}
                          className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Stroke Color</span>
                        <input
                          type="color"
                          value={activePresentation.styleSettings?.strokeColor || '#000000'}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, strokeColor: e.target.value } });
                          }}
                          className="w-full h-7 rounded-lg border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                        />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {stylePanelTab === 'spacing' && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Line Height (Spacing)</label>
                    <span className="text-xs font-mono text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                      {activePresentation.styleSettings?.lineSpacing || 1.2}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={activePresentation.styleSettings?.lineSpacing || 1.2}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lineSpacing: parseFloat(e.target.value) } });
                    }}
                    className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                  />
                  <p className="text-[9px] text-zinc-550 italic leading-relaxed">
                    Adjusts vertical spacing between lines of lyrics for optimal readability on big screens.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Letter Spacing (Kerning)</label>
                    <span className="text-xs font-mono text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
                      {activePresentation.styleSettings?.letterSpacing ?? 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="12"
                    step="1"
                    value={activePresentation.styleSettings?.letterSpacing ?? 0}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, letterSpacing: parseInt(e.target.value) } });
                    }}
                    className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-orange-500 outline-none"
                  />
                  <p className="text-[9px] text-zinc-550 italic leading-relaxed">
                    Adjusts horizontal kerning between letters for sleek typography overlays.
                  </p>
                </div>
              </div>
            )}

            {stylePanelTab === 'layout' && (
              <div className="space-y-6 animate-fade-in pb-8">
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Bilingual Slide Splits</span>
                      <span className="text-[9px] text-zinc-500 leading-normal font-sans pt-0.5">Splits slide texts containing "---" into a primary and an italicized secondary language block.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePresentation.styleSettings?.bilingualEnabled}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, bilingualEnabled: e.target.checked } });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white" />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Display Chords in Previews</span>
                      <span className="text-[9px] text-zinc-500 leading-normal font-sans pt-0.5">Toggle bracketed chords (e.g. [C], [G/B]) visible on operator console slide preview cards.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePresentation.styleSettings?.chordsEnabled}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, chordsEnabled: e.target.checked } });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white" />
                    </label>
                  </div>
                </div>

                {/* Lower Thirds */}
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-cyan-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Lower Third Mode</h3>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">
                      Overlays & Subtitles
                    </span>
                  </div>

                  <p className="text-[9.5px] text-zinc-500 leading-normal font-sans">
                    Configure the active stage overlay presentation mode for video streaming overlays or presenter banners.
                  </p>

                  <select
                    value={activePresentation.styleSettings?.lowerThirdMode || 'none'}
                    onChange={(e) => {
                      const ss = activePresentation.styleSettings || {};
                      onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdMode: e.target.value as any } });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-cyan-500 transition-all font-sans"
                  >
                    <option value="none">Standard Full Screen Display</option>
                    <option value="lyrics">Lower Third Lyrics Band</option>
                    <option value="speaker">Speaker Lower Third Banner</option>
                    <option value="ticker">Announcement Scrolling Ticker</option>
                  </select>
                </div>

                {activePresentation.styleSettings?.lowerThirdMode === 'speaker' && (
                  <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4 animate-fade-in text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Speaker Lower Third Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Speaker Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Pastor David"
                          value={activePresentation.styleSettings?.speakerName || ''}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, speakerName: e.target.value } });
                          }}
                          className="w-full bg-zinc-955 border border-zinc-855 text-zinc-250 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Speaker Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Lead Pastor"
                          value={activePresentation.styleSettings?.speakerTitle || ''}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, speakerTitle: e.target.value } });
                          }}
                          className="w-full bg-zinc-955 border border-zinc-855 text-zinc-250 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activePresentation.styleSettings?.lowerThirdMode === 'ticker' && (
                  <div className="p-4 bg-zinc-900/20 border border-zinc-855 rounded-2xl space-y-4 animate-fade-in text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-yellow-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Scrolling Ticker Announcements</h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Ticker Text</label>
                      <textarea
                        placeholder="Type announcements here..."
                        value={activePresentation.styleSettings?.tickerText || ''}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, tickerText: e.target.value } });
                        }}
                        className="w-full h-16 bg-zinc-955 border border-zinc-855 text-zinc-250 text-xs rounded-xl p-3 outline-none focus:border-yellow-500 transition-colors font-sans resize-none custom-scrollbar"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Scroll Speed (Duration)</label>
                        <span className="text-xs font-mono text-yellow-500 font-bold bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-500/20">
                          {activePresentation.styleSettings?.tickerSpeed || 20}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="1"
                        value={activePresentation.styleSettings?.tickerSpeed || 20}
                        onChange={(e) => {
                          const ss = activePresentation.styleSettings || {};
                          onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, tickerSpeed: parseInt(e.target.value) } });
                        }}
                        className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-yellow-500 outline-none"
                      />
                      <p className="text-[8.5px] text-zinc-550 italic font-sans leading-none">
                        Fewer seconds = faster scrolling. More seconds = slower scrolling.
                      </p>
                    </div>
                  </div>
                )}

                {activePresentation.styleSettings?.lowerThirdMode && activePresentation.styleSettings.lowerThirdMode !== 'none' && (
                  <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4 animate-fade-in text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-cyan-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Layout & Backing Styles</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Vertical Placement Y</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">
                          {activePresentation.styleSettings?.lowerThirdY ?? 80}%
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <select
                          value={activePresentation.styleSettings?.lowerThirdPosition || 'custom'}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdPosition: e.target.value as any } });
                          }}
                          className="bg-zinc-955 border border-zinc-855 text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-cyan-500 transition-all font-mono"
                        >
                          <option value="bottom-10">Bottom 10% (85% Y)</option>
                          <option value="bottom-20">Bottom 20% (75% Y)</option>
                          <option value="custom">Custom Position</option>
                        </select>
                        
                        {(activePresentation.styleSettings?.lowerThirdPosition || 'custom') === 'custom' && (
                          <input
                            type="range"
                            min="65"
                            max="96"
                            step="1"
                            value={activePresentation.styleSettings?.lowerThirdY ?? 80}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdY: parseInt(e.target.value) } });
                            }}
                            className="flex-1 h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-cyan-500 outline-none"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 border-t border-zinc-900/60">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Backing Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activePresentation.styleSettings?.lowerThirdBgColor || '#000000'}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdBgColor: e.target.value } });
                            }}
                            className="w-8 h-8 rounded-lg border border-zinc-805 bg-transparent cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            maxLength={7}
                            value={(activePresentation.styleSettings?.lowerThirdBgColor || '#000000').toUpperCase()}
                            onChange={(e) => {
                              const ss = activePresentation.styleSettings || {};
                              onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdBgColor: e.target.value } });
                            }}
                            className="flex-1 bg-zinc-955 border border-zinc-855 rounded-xl px-2 py-1.5 text-xs text-zinc-250 outline-none focus:border-cyan-500/60 uppercase font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Backing Opacity</label>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/20">
                            {activePresentation.styleSettings?.lowerThirdBgOpacity !== undefined ? activePresentation.styleSettings.lowerThirdBgOpacity : 0.65}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={activePresentation.styleSettings?.lowerThirdBgOpacity !== undefined ? activePresentation.styleSettings.lowerThirdBgOpacity : 0.65}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdBgOpacity: parseFloat(e.target.value) } });
                          }}
                          className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Glassmorphism Backdrop Blur</span>
                        <span className="text-[8.5px] text-zinc-550 leading-normal font-sans pt-0.5">Applies a premium translucent glass blur effect to the background bar.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!activePresentation.styleSettings?.lowerThirdBgBlur}
                          onChange={(e) => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({ ...activePresentation, styleSettings: { ...ss, lowerThirdBgBlur: e.target.checked } });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:after:bg-white" />
                      </label>
                    </div>

                  </div>
                )}

                {/* Slide Arrangement */}
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Custom Slide Arrangement</h3>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      Sequence Builder
                    </span>
                  </div>

                  <p className="text-[9.5px] text-zinc-500 leading-normal font-sans">
                    Arrange the slides in custom sequencing order (e.g. Verse 1 &rarr; Chorus &rarr; Verse 2 &rarr; Chorus &rarr; Bridge &rarr; Chorus). 
                    This creates the sequenced present mode list.
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Current Sequence order</span>
                    <div className="flex flex-wrap gap-1.5 p-3 min-h-[50px] bg-zinc-950 border border-zinc-900 rounded-xl items-center">
                      {activePresentation.styleSettings?.arrangement && activePresentation.styleSettings.arrangement.length > 0 ? (
                        activePresentation.styleSettings.arrangement.map((label, index) => (
                          <div key={index} className="flex items-center gap-1 bg-orange-950/65 border border-orange-500/25 text-orange-400 font-sans text-[10px] px-2 py-1 rounded-lg">
                            <span>{label}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const ss = activePresentation.styleSettings || {};
                                const arr = [...(ss.arrangement || [])];
                                arr.splice(index, 1);
                                onUpdatePresentation({
                                  ...activePresentation,
                                  styleSettings: { ...ss, arrangement: arr }
                                });
                              }}
                              className="text-orange-500 hover:text-orange-300 cursor-pointer pl-0.5 font-bold font-mono text-[10px]"
                            >
                              &times;
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-[9px] text-zinc-650 font-mono italic">No custom sequence configured. Slide flow is linear by default.</span>
                      )}
                    </div>

                    {activePresentation.styleSettings?.arrangement && activePresentation.styleSettings.arrangement.length > 0 && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const ss = activePresentation.styleSettings || {};
                            onUpdatePresentation({
                              ...activePresentation,
                              styleSettings: { ...ss, arrangement: undefined }
                            });
                          }}
                          className="text-[9px] font-mono text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          Reset to Linear Flow
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">Add Slide Blocks to Sequence</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(activePresentation.slides.map(s => s.label)))
                        .filter(Boolean)
                        .map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => {
                              const ss = activePresentation.styleSettings || {};
                              const arr = [...(ss.arrangement || [])];
                              arr.push(label);
                              onUpdatePresentation({
                                ...activePresentation,
                                styleSettings: { ...ss, arrangement: arr }
                              });
                            }}
                            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            + {label}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
{/* Scripture Modal */}
      {showScriptureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-150">Quick Scripture Slide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptureModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono font-bold hover:bg-zinc-800/50 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

            {bibles.length === 0 ? (
              <div className="py-4 text-center space-y-2">
                <Info className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                <p className="text-xs text-zinc-300 font-medium">No Offline Bibles Found</p>
                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-normal">
                  Please upload or import a Bible database under the **Bible** tab first to search and generate scripture slides.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Bible Version</label>
                  <select
                    value={selectedBibleId}
                    onChange={(e) => setSelectedBibleId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-855 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans"
                  >
                    {bibles.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Book</label>
                  <input
                    type="text"
                    id="quick-book-search-input"
                    placeholder="Type book name or alias (e.g. Gen, ps, யோசுவா)..."
                    value={fastSearchQuery}
                    onChange={(e) => {
                      setFastSearchQuery(e.target.value);
                      setActiveSuggestionIndex(0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (filteredBiblesBooks.length > 0) {
                          setActiveSuggestionIndex((prev) => (prev + 1) % filteredBiblesBooks.length);
                        }
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (filteredBiblesBooks.length > 0) {
                          setActiveSuggestionIndex((prev) => (prev - 1 + filteredBiblesBooks.length) % filteredBiblesBooks.length);
                        }
                      } else if (e.key === 'Enter') {
                        if (filteredBiblesBooks.length > 0) {
                          e.preventDefault();
                          const selected = filteredBiblesBooks[activeSuggestionIndex];
                          setSelectedBookId(selected.id);
                          setFastSearchQuery(selected.english);
                          
                          setSelectedChapter(1);
                          setSelectedVerseStart(1);
                          setSelectedVerseEnd(1);

                          setTimeout(() => {
                            document.getElementById('quick-chapter-input-field')?.focus();
                          }, 50);
                        }
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans"
                  />

                  {fastSearchQuery.trim() !== '' && filteredBiblesBooks.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredBiblesBooks.map((book, index) => {
                        const isHighlighted = index === activeSuggestionIndex;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() => {
                              setSelectedBookId(book.id);
                              setFastSearchQuery(book.english);
                              
                              setSelectedChapter(1);
                              setSelectedVerseStart(1);
                              setSelectedVerseEnd(1);

                              setTimeout(() => {
                                document.getElementById('quick-chapter-input-field')?.focus();
                              }, 50);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer border-b border-zinc-900 last:border-0 ${
                              isHighlighted
                                ? 'bg-orange-600 text-white font-bold'
                                : 'text-zinc-350 hover:bg-zinc-900/60 hover:text-zinc-200'
                            }`}
                          >
                            <span>{book.english} ({book.tamil})</span>
                            <span className={`text-[9px] font-mono px-1 rounded ${isHighlighted ? 'bg-neutral-950/20 text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                              {book.id}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {fastSearchQuery.trim() === '' && (
                    <div className="text-[10px] text-zinc-500 italic mt-1 px-1">
                      Currently selected: {activeBookInfo ? `${activeBookInfo.english} (${activeBookInfo.tamil})` : 'Genesis'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Chapter</label>
                    <input
                      type="number"
                      id="quick-chapter-input-field"
                      min={1}
                      max={maxChapters}
                      value={selectedChapter}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(maxChapters, parseInt(e.target.value) || 1));
                        setSelectedChapter(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('quick-verse-start-input')?.focus();
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-855 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Verse Start</label>
                    <input
                      type="number"
                      id="quick-verse-start-input"
                      min={1}
                      value={selectedVerseStart}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setSelectedVerseStart(val);
                        if (selectedVerseEnd < val) setSelectedVerseEnd(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('quick-verse-end-input')?.focus();
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-855 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block">Verse End</label>
                    <input
                      type="number"
                      id="quick-verse-end-input"
                      min={selectedVerseStart}
                      value={selectedVerseEnd}
                      onChange={(e) => {
                        const val = Math.max(selectedVerseStart, parseInt(e.target.value) || selectedVerseStart);
                        setSelectedVerseEnd(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertScripture();
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-855 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-colors font-sans text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Slides Formatting</label>
                  <div className="flex bg-black/45 p-1 rounded-xl border border-zinc-850">
                    <button
                      type="button"
                      onClick={() => setScriptureSplitMode('single')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer text-center font-sans font-bold capitalize ${
                        scriptureSplitMode === 'single'
                          ? 'bg-zinc-850 text-orange-400 border border-zinc-700/60 font-black'
                          : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Single Card (Combined)
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptureSplitMode('split')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer text-center font-sans font-bold capitalize ${
                        scriptureSplitMode === 'split'
                          ? 'bg-zinc-850 text-orange-400 border border-zinc-700/60 font-black'
                          : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Split Cards (One/Verse)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleInsertScripture}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-sans font-extrabold text-xs py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-950/20 uppercase tracking-wider transition-all"
                  >
                    Insert Scripture Slides
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
