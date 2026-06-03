import React from 'react';
import { BibleBookInfo, BIBLE_BOOKS_METADATA } from '../lib/bibleMetadata';
import { Book, Search, ArrowRight } from 'lucide-react';

interface KeywordResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  primaryText: string;
  refText?: string;
}

interface ParsedLookup {
  book: BibleBookInfo;
  chapter: number;
  verse: number;
}

interface BibleSearchPanelProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  parsedLookupResult: ParsedLookup | null;
  keywordSearchResults: KeywordResult[];
  isSearching: boolean;
  setBibleTab: (tab: 'browse' | 'search') => void;
  setActiveBookId: (id: string) => void;
  setActiveChapter: (chapter: number) => void;
  setActiveVerse: (verse: number) => void;
  getFormattedProjectionAndLabel: (book: BibleBookInfo, chapter: number, verse: number) => { text: string; label: string; descPosition: string };
  onProjectText: (text: string, referenceText: string, descPosition?: string) => void;
  setIsLiveActive: (v: boolean) => void;
}

export default function BibleSearchPanel({
  searchQuery,
  setSearchQuery,
  parsedLookupResult,
  keywordSearchResults,
  isSearching,
  setBibleTab,
  setActiveBookId,
  setActiveChapter,
  setActiveVerse,
  getFormattedProjectionAndLabel,
  onProjectText,
  setIsLiveActive,
}: BibleSearchPanelProps) {
  return (
    <div className="flex-1 flex flex-col p-5 min-h-0 overflow-y-auto custom-scrollbar">

      <div className="max-w-4xl w-full space-y-4">
        <div className="bg-zinc-950/70 p-4 border border-zinc-850 rounded-2xl shadow-lg space-y-3 animate-fade-in">
          <label className="text-[10px] font-mono text-orange-400 uppercase tracking-widest font-black block">
            KEYWORD SEARCH
          </label>

          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="e.g. 'John 3:16' or 'சங் 23' or 'faith', 'அன்பு'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-805 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none placeholder-zinc-550 transition-all font-sans"
                autoFocus
              />
            </div>

            {parsedLookupResult && (
              <button
                onClick={() => {
                  const { book, chapter, verse } = parsedLookupResult;
                  setActiveBookId(book.id);
                  setActiveChapter(chapter);
                  setActiveVerse(verse);

                  const { text, label, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(book, chapter, verse);

                  onProjectText(text, label, projectedDescPosition);
                  setIsLiveActive(true);
                  setBibleTab('browse');
                }}
                className="px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-[1.02] active:scale-[0.98] text-black text-xs font-sans font-extrabold uppercase rounded-xl tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-orange-400/20"
              >
                <span>Jump & Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {parsedLookupResult ? (
            <p className="text-[10px] font-mono text-emerald-400 font-bold animate-fade-in flex items-center gap-1">
              <span>✓ Ready: Match found for</span>
              <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-300">
                {parsedLookupResult.book.english} ({parsedLookupResult.book.tamil}) {parsedLookupResult.chapter}:{parsedLookupResult.verse}
              </span>
            </p>
          ) : searchQuery.trim().length > 1 ? (
            <p className="text-[9px] font-mono text-zinc-500">
              Press Search to scan popular index and local XML definitions.
            </p>
          ) : (
            <p className="text-[9.5px] font-sans text-zinc-550">
              Type a reference (e.g., <b>Ps 23:1</b>) to instantly trigger citation routing, or write search terms (e.g., <b>grace</b>) to discover matches in dual translations.
            </p>
          )}
        </div>

        {/* Results display panel */}
        {isSearching ? (
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-zinc-805/40 rounded animate-pulse w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-2.5 animate-pulse">
                  <div className="h-3.5 bg-zinc-800/65 rounded w-2/5" />
                  <div className="h-3 bg-zinc-800/40 rounded w-full" />
                  <div className="h-3 bg-zinc-800/30 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery.trim() && keywordSearchResults.length > 0 ? (
          <div className="space-y-3.5 pt-1">
            <h4 className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-between">
              <span>Keyword Search Results:</span>
              <span className="text-orange-400">({keywordSearchResults.length} verses found)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {keywordSearchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveBookId(result.bookId);
                    setActiveChapter(result.chapter);
                    setActiveVerse(result.verse);

                    const bookObj = BIBLE_BOOKS_METADATA.find(b => b.id === result.bookId) || BIBLE_BOOKS_METADATA[0];
                    const { text: combined, label: labelText, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(bookObj, result.chapter, result.verse);

                    onProjectText(combined, labelText, projectedDescPosition);
                    setIsLiveActive(true);
                    setBibleTab('browse');
                  }}
                  className="p-4 bg-zinc-950 hover:bg-zinc-900/80 border border-zinc-850 hover:border-orange-500/35 rounded-xl text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between hover:scale-[1.01] duration-300 h-auto min-h-0"
                >
                  <div className="space-y-2 h-auto">
                    <span className="text-[10px] bg-orange-950/50 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-mono font-bold group-hover:border-orange-500/50 transition-colors inline-block">
                      {result.bookName} {result.chapter}:{result.verse}
                    </span>

                    <p className="text-xs text-zinc-100 font-sans leading-normal font-medium pt-1 break-words whitespace-normal">
                      {result.primaryText}
                    </p>
                    {result.refText && (
                      <p className="text-[11px] text-zinc-450 font-sans italic border-t border-zinc-900 pt-1 break-words whitespace-normal">
                        {result.refText}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 text-[9px] font-mono text-zinc-500 font-bold flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Project verse</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : searchQuery.trim() ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-zinc-500 text-xs font-sans">
              No matching verses found for "<b>{searchQuery}</b>".
            </p>
            <p className="text-[10px] font-mono text-zinc-650">
              Try searching simple concepts (e.g. "நம்பிக்கை", "தேவன்", "love", "faith").
            </p>
          </div>
        ) : (
          <div className="py-6 border-2 border-dashed border-zinc-850 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-zinc-550 space-y-4">
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-full text-zinc-400">
              <Book className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs text-zinc-300 font-mono font-black uppercase tracking-wider">Awaiting query input</h5>
              <p className="text-[11px] font-sans text-zinc-500 max-w-sm mt-1">
                Type dynamic queries in the input area above. The lookup engine searches offline Tamil and English translations instantly.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
