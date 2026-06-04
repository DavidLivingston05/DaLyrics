import { BibleBookInfo } from '../lib/bibleMetadata';
import { Search } from 'lucide-react';

interface BibleGridProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredBooks: BibleBookInfo[];
  activeBookId: string;
  setActiveBookId: (id: string) => void;
  activeChapter: number;
  setActiveChapter: (chapter: number) => void;
  activeVerse: number;
  setActiveVerse: (verse: number) => void;
  activeBook: BibleBookInfo;
  versesInChapterCount: number;
  handleTriggerProjectVerse: (verseNum: number, customBook?: BibleBookInfo, customChapter?: number) => void;
}

export default function BibleGrid({
  searchQuery,
  setSearchQuery,
  filteredBooks,
  activeBookId,
  setActiveBookId,
  activeChapter,
  setActiveChapter,
  activeVerse,
  setActiveVerse,
  activeBook,
  versesInChapterCount,
  handleTriggerProjectVerse,
}: BibleGridProps) {
  return (
    <>
      {/* TOP HALF: Books Grid */}
      <div className="flex-1 flex flex-col p-4 border-b border-zinc-800 min-h-0">

        {/* Section banner and Searchbar */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>Books Selector Grid</span>
            </h2>
          </div>

          {/* Search Input inline */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter books (e.g. ஆதி, Gen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800/60 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 focus:outline-none text-xs rounded-lg pl-8 pr-3 py-1.5 text-zinc-250 placeholder-zinc-600 transition-all font-sans"
            />
          </div>
        </div>

        {/* Book Cell grids: 11 fixed columns like BibleGrid */}
        <div className="flex-1 overflow-y-auto p-1 min-h-0 custom-scrollbar">
          <div className="biblegrid-books">
            {filteredBooks.map((book) => {
              const isActive = activeBookId === book.id;
              return (
                <button
                  key={book.id}
                  onClick={() => {
                    setActiveBookId(book.id);
                    setActiveChapter(1);
                    setActiveVerse(1);
                  }}
                  className={`biblegrid-cell ${isActive ? 'active' : ''}`}
                >
                  <span className="biblegrid-abbr">{book.tamilAbbrev}</span>
                  <span className="biblegrid-name">{book.english}</span>
                </button>
              );
            })}
            {filteredBooks.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-zinc-500 font-mono">
                No books match the search query
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM HALF: Numbers Grid (Chapters on left; Verses on right) */}
      <div className="h-2/5 flex border-b border-zinc-900/80 min-h-0">

        {/* Left Pane (Chapters Grid) */}
        <div className="flex-1 border-r border-zinc-850/60 flex flex-col p-4 pt-3 min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#d97706]/95">
              Chapters Catalogue
            </h3>
            <span className="text-[10px] font-bold text-zinc-550 uppercase">
              {activeBook.english} &bull; {activeBook.chaptersCount} Chs
            </span>
          </div>

          <div className="flex-1 bg-zinc-950/45 border border-zinc-850/60 rounded-xl p-3 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar min-h-0">
              <div className="biblegrid-chapters">
                {activeBook ? (
                  Array.from({ length: activeBook.chaptersCount }).map((_, idx) => {
                    const chapNum = idx + 1;
                    const isSelected = activeChapter === chapNum;
                    return (
                      <button
                        key={chapNum}
                        onClick={() => {
                          setActiveChapter(chapNum);
                          setActiveVerse(1);
                        }}
                        className={`biblegrid-cell biblegrid-number ${isSelected ? 'active' : ''}`}
                      >
                        {chapNum}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-4 text-center text-xs text-zinc-500 font-mono">
                    Loading books ...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (Verses Grid) */}
        <div className="flex-1 flex flex-col p-4 pt-3 min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <h3 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-orange-400/80">
              Verses Index
            </h3>
            <span className="text-[10px] font-bold text-zinc-550 uppercase font-sans">
              {activeBook.english} {activeChapter} &bull; {versesInChapterCount} Verses
            </span>
          </div>

          <div className="flex-1 bg-zinc-950/45 border border-zinc-850/60 rounded-xl p-3 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar min-h-0">
              <div className="biblegrid-verses">
                {Array.from({ length: versesInChapterCount }).map((_, idx) => {
                  const verseNum = idx + 1;
                  const isSelected = activeVerse === verseNum;
                  return (
                    <button
                      key={verseNum}
                      onClick={() => handleTriggerProjectVerse(verseNum)}
                      className={`biblegrid-cell biblegrid-number ${isSelected ? 'active' : ''}`}
                    >
                      {verseNum}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
