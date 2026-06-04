import React, { useMemo } from 'react';
import { Presentation } from '../types';
import { useBibleStyle } from '../contexts/BibleStyleContext';
import { Tv, Trash2, ListMusic, ArrowRight, History, Star } from 'lucide-react';

interface LiveMonitorProps {
  activePresentation: Presentation | null;
  activeSlideIndex: number | null;
  isTextCleared: boolean;
  onToggleClearText: () => void;
  isBlackout: boolean;
  onToggleBlackout: () => void;
  isLowerThird: boolean;
  onToggleLowerThird: () => void;
  onProjectToTV: () => void;
  bibleDescPosition?: string;
  activeMode: string;
  setlist?: { uniqueId: string; presentationId: string; title: string }[];
  onRemoveFromSetlist?: (uniqueId: string) => void;
  onSelectPresentation?: (id: string) => void;
  bibleHistory?: { bookId: string; bookName: string; chapter: number; verse: number }[];
  bibleSavedVerses?: { bookId: string; bookName: string; chapter: number; verse: number; primaryText: string; refText?: string }[];
  onRemoveSavedVerse?: (bookId: string, chapter: number, verse: number) => void;
  onJumpToVerse?: (bookId: string, chapter: number, verse: number) => void;
}

export default function LiveMonitor({
  activePresentation, activeSlideIndex,
  isTextCleared, onToggleClearText,
  isBlackout, onToggleBlackout,
  isLowerThird, onToggleLowerThird,
  onProjectToTV,
  bibleDescPosition = 'top_separate', activeMode = 'SONGS',
  setlist = [], onRemoveFromSetlist, onSelectPresentation,
  bibleHistory = [], bibleSavedVerses = [],
  onRemoveSavedVerse, onJumpToVerse,
}: LiveMonitorProps) {

  const [bibleHubTab, setBibleHubTab] = React.useState<'history' | 'saved'>('history');
  const bs = useBibleStyle();

  const activeSlide = useMemo(() => {
    if (activePresentation && activeSlideIndex !== null)
      return activePresentation.slides[activeSlideIndex] || null;
    return null;
  }, [activePresentation, activeSlideIndex]);

  const isDisplayingText = activeSlide && !isTextCleared && !isBlackout;
  const activeText = isDisplayingText ? activeSlide!.text : '';

  const reference = activePresentation?.copyright || '';

  const previewBibleOverlay = (): React.CSSProperties => {
    if (activeMode !== 'BIBLE' || !activeText) return {};
    const hex = (bs.bibleVerseBgColor || '#000000').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const rgb = (!isNaN(r) && !isNaN(g) && !isNaN(b)) ? `${r},${g},${b}` : '0,0,0';
    return {
      backgroundColor: `rgba(${rgb},${(bs.bibleVerseBgOpacity ?? 0) / 100})`,
      padding: '0.4rem 0.8rem', borderRadius: '0.5rem',
      border: (bs.bibleVerseBgOpacity ?? 0) > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
      width: '95%', margin: '0 auto',
    };
  };

  const previewHeading = (): React.CSSProperties => {
    if (activeMode !== 'BIBLE' || !reference) return {};
    const hex = (bs.bibleHeadingBgColor || '#101010').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const rgb = (!isNaN(r) && !isNaN(g) && !isNaN(b)) ? `${r},${g},${b}` : '10,10,10';
    return {
      fontSize: `${bs.bibleHeadingFontSize * 0.045}rem`,
      color: bs.bibleHeadingFontColor || '#fff',
      backgroundColor: `rgba(${rgb},${(bs.bibleHeadingBgOpacity ?? 60) / 100})`,
      border: (bs.bibleHeadingBgOpacity ?? 0) > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
    };
  };

  return (
    <div className="w-96 bg-zinc-950 border-l border-zinc-900 flex flex-col h-full shrink-0 select-none font-sans shadow-2xl shadow-black/30">
      {/* Header */}
      <div className="p-4 py-5 border-b border-zinc-900/60 flex items-center justify-between shrink-0 bg-neutral-950">
        <h2 className="text-[12px] font-display font-extrabold uppercase tracking-[0.15em] text-zinc-400">
          Live Monitor
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBlackout ? 'bg-rose-500' : isTextCleared ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider">
            {isBlackout ? 'BLACKOUT' : isTextCleared ? 'CLEARED' : 'ON AIR'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Project button */}
        <button
          type="button"
          onClick={onProjectToTV}
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:brightness-110 text-white text-xs font-display font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-orange-950/20 active:scale-[0.98] border border-orange-400/20"
        >
          <Tv className="w-4 h-4" />
          <span>Project to TV Screen</span>
        </button>

        {/* Live Preview */}
        <div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
              Stage Preview
            </span>
            {activeSlide && (
              <span className="text-[9px] font-mono text-zinc-600 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-900/80">
                Slide {activeSlideIndex! + 1}
              </span>
            )}
          </div>

          <div className="w-full rounded-xl border border-zinc-800 bg-black relative flex flex-col overflow-hidden shadow-2xl" style={{ aspectRatio: '16 / 9', minHeight: '200px' }}>
            {/* Grid pattern */}
            {!isDisplayingText && !isBlackout && (
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:10px_10px]" />
            )}

            <div className="absolute top-2 left-2 z-20">
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/85 rounded-md border border-zinc-900/85">
                <span className={`w-1.5 h-1.5 rounded-full ${isBlackout ? 'bg-zinc-600' : 'bg-rose-500 animate-pulse'}`} />
                <span className="text-[7px] font-mono text-zinc-400 tracking-wider font-extrabold uppercase">LIVE</span>
              </div>
            </div>

            {isBlackout ? null : isTextCleared ? null : activeText ? (
              <div className="flex-1 flex flex-col items-center justify-center p-[3%] z-10">
                {/* Heading */}
                {/* Reference heading (top position) */}
                {reference && activeMode === 'BIBLE' && bibleDescPosition === 'top_separate' && (
                  <span className="text-[9px] font-sans font-bold text-white bg-neutral-950/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-sm mb-2 inline-block" style={previewHeading()}>
                    {reference}
                  </span>
                )}

                {/* Verse text */}
                <div className="w-full flex items-center justify-center" style={previewBibleOverlay()}>
                  <p
                    className="break-words whitespace-pre-wrap text-center leading-snug select-text"
                    style={{
                      fontSize: activeMode === 'BIBLE' ? `${bs.bibleVerseFontSize * 0.065}rem` : '1rem',
                      color: activeMode === 'BIBLE' ? bs.bibleVerseFontColor : '#fff',
                      fontFamily: 'system-ui',
                      fontWeight: 600,
                    }}
                  >
                    {activeText}
                  </p>
                </div>

                {/* Reference at bottom */}
                {reference && (activeMode !== 'BIBLE' || bibleDescPosition !== 'top_separate') && (
                  bibleDescPosition === 'bottom_separate' && activeMode === 'BIBLE' ? (
                    <span className="text-[9px] font-sans font-bold text-white bg-neutral-950/60 border border-white/10 px-3 py-1.5 rounded backdrop-blur-sm mt-2 inline-block" style={previewHeading()}>
                      {reference}
                    </span>
                  ) : (
                    <span className="text-[6px] font-mono text-zinc-500 uppercase tracking-widest absolute bottom-1">
                      {reference}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 flex-1 flex items-center justify-center z-10 font-bold">
                No active slide
              </p>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleClearText}
            className={`flex-1 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              isTextCleared
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-inner shadow-amber-950/20'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onToggleBlackout}
            className={`flex-1 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              isBlackout
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-inner shadow-rose-950/20'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Blackout
          </button>
          <button
            type="button"
            onClick={onToggleLowerThird}
            className={`flex-1 py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
              isLowerThird
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-inner shadow-blue-950/20'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Lower
          </button>
        </div>

        {/* Bottom panel: Bible Hub or Setlist */}
        {activeMode === 'BIBLE' ? (
          /* Bible Hub */
          <div className="flex flex-col flex-1 min-h-0 bg-zinc-900/10 rounded-xl border border-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-mono font-black text-zinc-400 uppercase tracking-widest">Bible Hub</span>
              </div>
              <div className="flex gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/60">
                <button onClick={() => setBibleHubTab('history')} className={`py-1 px-3 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${bibleHubTab === 'history' ? 'bg-zinc-800 text-orange-400 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>History</button>
                <button onClick={() => setBibleHubTab('saved')} className={`py-1 px-3 rounded-md text-[10px] font-mono font-bold uppercase tracking-wide transition-all cursor-pointer ${bibleHubTab === 'saved' ? 'bg-zinc-800 text-orange-400 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>Saved</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[200px]">
              {bibleHubTab === 'history' ? (
                bibleHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-zinc-600">
                    <History className="w-5 h-5 text-zinc-700 mb-2" />
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold">History Empty</p>
                  </div>
                ) : (
                  bibleHistory.map((item, idx) => (
                    <div key={idx} onClick={() => onJumpToVerse?.(item.bookId, item.chapter, item.verse)} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/20 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-all">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 w-4">{idx + 1}</span>
                      <span className="text-xs text-zinc-300 truncate flex-1 ml-2">{item.bookName} {item.chapter}:{item.verse}</span>
                      <span className="text-[8px] font-mono text-zinc-600 uppercase">Jump</span>
                    </div>
                  ))
                )
              ) : (
                bibleSavedVerses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-zinc-600">
                    <Star className="w-5 h-5 text-zinc-700 mb-2" />
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold">No Saved Verses</p>
                  </div>
                ) : (
                  bibleSavedVerses.map((item, idx) => (
                    <div key={idx} onClick={() => onJumpToVerse?.(item.bookId, item.chapter, item.verse)} className="p-2.5 rounded-lg bg-zinc-900/20 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-all space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400">{item.bookName} {item.chapter}:{item.verse}</span>
                        <button onClick={(e) => { e.stopPropagation(); onRemoveSavedVerse?.(item.bookId, item.chapter, item.verse); }} className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic truncate">{item.primaryText}</p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        ) : (
          /* Setlist */
          <div className="flex flex-col flex-1 min-h-0 bg-zinc-900/10 rounded-xl border border-zinc-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-mono font-black text-zinc-400 uppercase tracking-widest">Setlist</span>
              </div>
              {setlist.length > 0 && (
                <span className="text-[9px] font-mono font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">{setlist.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[200px]">
              {setlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-zinc-600">
                  <ListMusic className="w-5 h-5 text-zinc-700 mb-2" />
                  <p className="text-[10px] font-mono uppercase tracking-widest font-bold">Setlist Empty</p>
                </div>
              ) : (
                setlist.map((item, idx) => {
                  const activeIdx = setlist.findIndex(q => q.presentationId === activePresentation?.id);
                  const isActive = activeIdx === idx && activeMode === 'SONGS';
                  const isNext = activeIdx >= 0 ? idx === activeIdx + 1 : idx === 0;
                  return (
                    <div key={item.uniqueId} onClick={() => onSelectPresentation?.(item.presentationId)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isActive ? 'bg-orange-500/10 border-orange-500/40' : isNext ? 'bg-amber-500/5 border-amber-500/15 hover:bg-zinc-900' : 'bg-zinc-900/20 border-transparent hover:bg-zinc-900'
                      }`}>
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className={`text-[10px] font-mono font-bold w-4 ${isActive ? 'text-orange-400' : isNext ? 'text-amber-400' : 'text-zinc-600'}`}>{idx + 1}</span>
                        <span className={`text-xs truncate ${isActive ? 'text-orange-300 font-bold' : isNext ? 'text-zinc-200 font-semibold' : 'text-zinc-400'}`}>{item.title}</span>
                        {isActive && <span className="text-[8px] font-mono bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded font-extrabold uppercase">Live</span>}
                        {isNext && !isActive && <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onRemoveFromSetlist?.(item.uniqueId); }} className="p-1 text-zinc-600 hover:text-rose-400 transition-colors shrink-0"><Trash2 className="w-3 h-3" /></button>
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
