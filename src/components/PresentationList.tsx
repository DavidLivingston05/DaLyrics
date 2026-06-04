import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Presentation } from '../types';
import { Plus, Trash2, Edit2, Check, Music, Search, Sparkles, Upload, FileText } from 'lucide-react';
import { transliterateToEnglish } from '../lib/transliterate';

const parseTextToPresentations = (
  text: string,
  fileName: string,
  fileId: string,
  delimiter: 'triple-hyphen' | 'custom',
  customDelimiter: string
): Presentation[] => {
  let rawBlocks: string[] = [];
  const sep = delimiter === 'triple-hyphen' ? '---' : customDelimiter;

  if (delimiter === 'triple-hyphen') {
    if (text.includes('---')) {
      rawBlocks = text.split(/\n\s*-{3,}\s*\n/);
    } else {
      rawBlocks = [text];
    }
  } else if (sep.trim()) {
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\n\\s*${escapeRegExp(sep)}\\s*\\n`);
    if (text.match(regex)) {
      rawBlocks = text.split(regex);
    } else {
      rawBlocks = [text];
    }
  } else {
    rawBlocks = [text];
  }

  const presentationsList: Presentation[] = [];

  rawBlocks.forEach((block, blockIdx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    const lines = trimmedBlock.split('\n');
    let title = '';
    let lyricsStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        title = lines[i].trim().replace(/^title\s*:\s*/i, '');
        lyricsStartIndex = i + 1;
        break;
      }
    }

    if (!title) {
      title = fileName.replace(/\.[^/.]+$/, "");
      if (rawBlocks.length > 1) {
        title += ` (Part ${blockIdx + 1})`;
      }
    }

    const lyricsBlock = lines.slice(lyricsStartIndex).join('\n').trim();
    const slideTexts = lyricsBlock.split(/\n\s*\n+/).filter(t => t.trim() !== '');

    const slides = slideTexts.map((slideText, idx) => {
      const slideLines = slideText.split('\n');
      let label = `Slide ${idx + 1}`;
      let actualText = slideText.trim();

      if (slideLines.length > 0) {
        const firstLine = slideLines[0].trim();
        const bracketMatch = firstLine.match(/^\[(.*)\]$/);
        const isCommonLabel = /^(verse|chorus|bridge|intro|ending|outro|tag|slide|praise|welcome|refrain|blank|pre-chorus|interlude|chorus\s+\d+|verse\s+\d+)(\s+\d+)?$/i.test(firstLine);

        if (bracketMatch) {
          label = bracketMatch[1].trim();
          actualText = slideLines.slice(1).join('\n').trim();
        } else if (isCommonLabel) {
          label = firstLine;
          actualText = slideLines.slice(1).join('\n').trim();
        }
      }

      return {
        id: `slide-bulk-file-${fileId}-${blockIdx}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        label,
        text: actualText
      };
    });

    const finalSlides = slides.length > 0 ? slides : [{
      id: `slide-bulk-file-empty-${fileId}-${blockIdx}-${Date.now()}`,
      label: 'Slide 1',
      text: ''
    }];

    presentationsList.push({
      id: `pres-bulk-file-${fileId}-${blockIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      category: 'Song' as const,
      slides: finalSlides
    });
  });

  return presentationsList;
};

interface PresentationListProps {
  presentations: Presentation[];
  activePresentationId: string | null;
  onSelect: (id: string) => void;
  onAdd: (title: string) => void;
  onAddBulk: (items: Presentation[]) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onAddToSetlist?: (presentation: Presentation) => void;
  onChangeFolder?: (id: string, folder: string | undefined) => void;
  onDeleteMultiple?: (ids: string[]) => void;
}

function PresentationList({
  presentations,
  activePresentationId,
  onSelect,
  onAdd,
  onAddBulk,
  onDelete,
  onRename,
  onAddToSetlist,
  onChangeFolder,
  onDeleteMultiple
}: PresentationListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical'>(() => {
    return (localStorage.getItem('library_sort_by') as 'newest' | 'alphabetical') || 'newest';
  });

  useEffect(() => {
    localStorage.setItem('library_sort_by', sortBy);
  }, [sortBy]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(tempSearchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [tempSearchQuery]);


  const [visibleCount, setVisibleCount] = useState(150);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportTab, setBulkImportTab] = useState<'files' | 'paste' | 'xml'>('files');
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: number }[]>([]);
  const [parsedFromFilePresentationsState, setParsedFromFilePresentationsState] = useState<Presentation[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [delimiter, setDelimiter] = useState<'triple-hyphen' | 'custom'>('triple-hyphen'); 
  const [customDelimiter, setCustomDelimiter] = useState('---');

  // XML import state
  const [xmlUploadedFiles, setXmlUploadedFiles] = useState<{ id: string; name: string; size: number }[]>([]);
  const [parsedFromXmlPresentationsState, setParsedFromXmlPresentationsState] = useState<Presentation[]>([]);
  const [isXmlImporting, setIsXmlImporting] = useState(false);
  const [xmlImportProgress, setXmlImportProgress] = useState({ current: 0, total: 0 });

  const parseXmlSong = (xmlText: string): Presentation | null => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      // Try OpenSong format: <song><title>...<lyrics><verse ...>
      const songEl = doc.querySelector('song') || doc.querySelector('Song') || doc.documentElement;
      if (!songEl || songEl.tagName === 'parsererror') return null;

      const getTagText = (tag: string) => {
        const el = songEl.querySelector(tag);
        return el ? el.textContent?.trim() || '' : '';
      };

      let title = getTagText('title') || getTagText('Title') || getTagText('name') || 'Untitled Song';
      const author = getTagText('author') || getTagText('Author') || '';
      const copyright = getTagText('copyright') || getTagText('Copyright') || '';

      // Parse lyrics - try multiple XML formats
      const slides: { label: string; text: string }[] = [];

      // Format 1: OpenSong <lyrics><verse name="v1">...</verse></lyrics>
      const lyricsEl = songEl.querySelector('lyrics') || songEl.querySelector('Lyrics');
      if (lyricsEl) {
        const verses = lyricsEl.querySelectorAll('verse');
        if (verses.length > 0) {
          verses.forEach((v) => {
            const name = v.getAttribute('name') || v.getAttribute('label') || '';
            const text = (v.textContent || '').trim();
            if (text) {
              slides.push({
                label: name || `Slide ${slides.length + 1}`,
                text
              });
            }
          });
        }
      }

      // Format 2: OpenLP / plain <slide> elements
      if (slides.length === 0) {
        const slideEls = songEl.querySelectorAll('slide');
        slideEls.forEach((s, i) => {
          const text = (s.textContent || '').trim();
          if (text) {
            slides.push({
              label: s.getAttribute('label') || s.getAttribute('name') || `Slide ${i + 1}`,
              text
            });
          }
        });
      }

      // Format 3: <lyrics> as raw text split by double-newlines or <br/>
      if (slides.length === 0 && lyricsEl) {
        const raw = lyricsEl.innerHTML;
        const parts = raw.split(/<br\s*\/?>/i).filter(p => p.trim());
        if (parts.length > 1) {
          parts.forEach((p, i) => {
            const text = p.replace(/<[^>]+>/g, '').trim();
            if (text) slides.push({ label: `Slide ${i + 1}`, text });
          });
        } else {
          const text = (lyricsEl.textContent || '').trim();
          if (text) slides.push({ label: 'Slide 1', text });
        }
      }

      // Format 4: Direct <verse> children of root
      if (slides.length === 0) {
        const verses = songEl.querySelectorAll('verse');
        verses.forEach((v, i) => {
          const text = (v.textContent || '').trim();
          if (text) {
            slides.push({
              label: v.getAttribute('name') || v.getAttribute('number') || `Verse ${i + 1}`,
              text
            });
          }
        });
      }

      if (slides.length === 0) return null;

      return {
        id: `pres-xml-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        category: 'Song' as const,
        copyright: copyright || undefined,
        slides: slides.map((s, i) => ({
          id: `slide-xml-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          label: s.label,
          text: s.text
        }))
      };
    } catch {
      return null;
    }
  };

  const handleXmlFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter(
      (file) => file.name.endsWith('.xml') || file.type === 'text/xml' || file.type === 'application/xml'
    );
    if (fileArray.length === 0) return;

    setIsXmlImporting(true);
    setXmlImportProgress({ current: 0, total: fileArray.length });

    const newFileInfo: { id: string; name: string; size: number }[] = [];
    const newParsed: Presentation[] = [];

    for (const file of fileArray) {
      try {
        const text = await file.text();
        const pres = parseXmlSong(text);
        if (pres) {
          newParsed.push(pres);
          newFileInfo.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: file.name,
            size: file.size
          });
        }
      } catch (err) {
        console.error("Failed to parse XML:", file.name, err);
      }
      setXmlImportProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setXmlUploadedFiles(prev => [...prev, ...newFileInfo]);
    setParsedFromXmlPresentationsState(prev => [...prev, ...newParsed]);
    setIsXmlImporting(false);
  };

  const removeXmlFile = (id: string, fileIndex: number) => {
    setXmlUploadedFiles(prev => prev.filter(f => f.id !== id));
    setParsedFromXmlPresentationsState(prev => prev.filter((_, i) => i !== fileIndex));
  };

  const handleXmlDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleXmlFiles(e.dataTransfer.files);
  }, []);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter(
      (file) => file.name.endsWith('.txt') || file.type === 'text/plain'
    );
    const totalFiles = fileArray.length;
    if (totalFiles === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: totalFiles });

    const batchSize = 150;
    const newFileInfo: { id: string; name: string; size: number }[] = [];
    const newParsedPresentations: Presentation[] = [];

    for (let i = 0; i < totalFiles; i += batchSize) {
      const currentBatch = fileArray.slice(i, i + batchSize);
      
      const results = await Promise.all(
        currentBatch.map(async (file) => {
          try {
            const text = await file.text();
            return { name: file.name, text, size: file.size };
          } catch (err) {
            console.error("Failed to read file", file.name, err);
            return null;
          }
        })
      );

      results.forEach((res) => {
        if (!res) return;
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        newFileInfo.push({
          id: fileId,
          name: res.name,
          size: res.size
        });

        const parsed = parseTextToPresentations(res.text, res.name, fileId, delimiter, customDelimiter);
        newParsedPresentations.push(...parsed);
      });

      const processedCount = Math.min(i + batchSize, totalFiles);
      setImportProgress({ current: processedCount, total: totalFiles });

      // Yield thread to animate loader bar nicely without freezing
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    setUploadedFiles((prev) => [...prev, ...newFileInfo]);
    setParsedFromFilePresentationsState((prev) => [...prev, ...newParsedPresentations]);
    setIsImporting(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    setParsedFromFilePresentationsState((prev) => prev.filter((p) => !p.id.includes(id)));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    onAdd(newItemTitle.trim());
    setNewItemTitle('');
    setShowAddForm(false);
  };

  const startEditing = (p: Presentation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditTitle(p.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    if (!text) return false;
    const t = text.toLowerCase().normalize('NFC');
    const q = query.toLowerCase().normalize('NFC');

    if (t.includes(q)) return true;

    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    if (qi === q.length) return true;

    return false;
  };

  const anyFieldMatches = (presentation: Presentation, query: string): { match: boolean; preview: string } => {
    const q = query.trim();
    if (!q) return { match: true, preview: '' };

    // Check title (original + transliterated)
    if (fuzzyMatch(presentation.title, q)) return { match: true, preview: '' };
    if (fuzzyMatch(transliterateToEnglish(presentation.title), q)) return { match: true, preview: '' };

    // Check lyrics
    for (const slide of presentation.slides) {
      for (const line of slide.text.split('\n')) {
        if (!line.trim()) continue;
        if (fuzzyMatch(line, q)) return { match: true, preview: line.trim().slice(0, 80) };
        if (fuzzyMatch(transliterateToEnglish(line), q)) return { match: true, preview: line.trim().slice(0, 80) };
      }
    }

    return { match: false, preview: '' };
  };

  const filteredPresentations = useMemo(() => {
    let result = presentations.filter((p) =>
      anyFieldMatches(p, searchQuery).match
    );

    if (sortBy === 'alphabetical') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result = [...result].sort((a, b) => {
        // Parse numbers out of IDs which represent timestamps
        const aNum = parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const bNum = parseInt(b.id.replace(/\D/g, '') || '0', 10);
        if (aNum && bNum && aNum !== bNum) {
          return bNum - aNum;
        }
        // Fallback to reversed indices in primary array
        return presentations.indexOf(b) - presentations.indexOf(a);
      });
    }

    return result;
  }, [presentations, searchQuery, sortBy]);

  const matchPreviews = useMemo(() => {
    if (!searchQuery.trim()) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const p of presentations) {
      const r = anyFieldMatches(p, searchQuery);
      if (r.preview) map[p.id] = r.preview;
    }
    return map;
  }, [presentations, searchQuery]);

  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text;
    const t = text.toLowerCase().normalize('NFC');
    const q = searchQuery.toLowerCase().normalize('NFC');
    const idx = t.indexOf(q);
    if (idx !== -1) {
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + searchQuery.length);
      const after = text.slice(idx + searchQuery.length);
      return <>{before}<span className="text-orange-400 font-extrabold">{match}</span>{after}</>;
    }
    // Try transliterated match
    const romanized = transliterateToEnglish(text).toLowerCase();
    const ri = romanized.indexOf(q);
    if (ri !== -1) {
      const before = text.slice(0, ri);
      const match = text.slice(ri, ri + searchQuery.length);
      const after = text.slice(ri + searchQuery.length);
      return <>{before}<span className="text-orange-400 font-extrabold">{match}</span>{after}</>;
    }
    return text;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      setVisibleCount((prev) => Math.min(prev + 100, filteredPresentations.length));
    }
  };

  // Reset viewport on search
  useEffect(() => {
    setVisibleCount(150);
  }, [searchQuery]);

  // Safeguard against high-cardinality render lag
  const visiblePresentations = useMemo(() => {
    const sliced = filteredPresentations.slice(0, visibleCount);
    const isAlreadyVisible = sliced.some(p => p.id === activePresentationId);
    if (!isAlreadyVisible && activePresentationId) {
      const activeObj = filteredPresentations.find(p => p.id === activePresentationId);
      if (activeObj) {
        sliced.push(activeObj);
      }
    }
    return sliced;
  }, [filteredPresentations, visibleCount, activePresentationId]);

  const parsedPresentations = useMemo(() => {
    if (!bulkText.trim()) return [];

    let rawBlocks: string[] = [];
    const sep = delimiter === 'triple-hyphen' ? '---' : customDelimiter;

    if (delimiter === 'triple-hyphen') {
      rawBlocks = bulkText.split(/\n\s*-{3,}\s*\n/);
    } else if (sep.trim()) {
      const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\n\\s*${escapeRegExp(sep)}\\s*\\n`);
      rawBlocks = bulkText.split(regex);
    } else {
      rawBlocks = [bulkText];
    }

    if (rawBlocks.length <= 1 && !bulkText.includes('---')) {
      rawBlocks = [bulkText];
    }

    return rawBlocks.map((block, itemIdx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      const lines = trimmedBlock.split('\n');
      let title = '';
      let lyricsStartIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim()) {
          title = lines[i].trim().replace(/^title\s*:\s*/i, '');
          lyricsStartIndex = i + 1;
          break;
        }
      }

      if (!title) {
        title = `Imported Song ${itemIdx + 1}`;
      }

      const lyricsBlock = lines.slice(lyricsStartIndex).join('\n').trim();
      const slideTexts = lyricsBlock.split(/\n\s*\n+/).filter(t => t.trim() !== '');

      const slides = slideTexts.map((slideText, idx) => {
        const slideLines = slideText.split('\n');
        let label = `Slide ${idx + 1}`;
        let actualText = slideText.trim();

        if (slideLines.length > 0) {
          const firstLine = slideLines[0].trim();
          const bracketMatch = firstLine.match(/^\[(.*)\]$/);
          const isCommonLabel = /^(verse|chorus|bridge|intro|ending|outro|tag|slide|praise|welcome|refrain|blank|pre-chorus|interlude|chorus\s+\d+|verse\s+\d+)(\s+\d+)?$/i.test(firstLine);

          if (bracketMatch) {
            label = bracketMatch[1].trim();
            actualText = slideLines.slice(1).join('\n').trim();
          } else if (isCommonLabel) {
            label = firstLine;
            actualText = slideLines.slice(1).join('\n').trim();
          }
        }

        return {
          id: `slide-bulk-${itemIdx}-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          label,
          text: actualText
        };
      });

      const finalSlides = slides.length > 0 ? slides : [{
        id: `slide-bulk-empty-${itemIdx}-${Date.now()}`,
        label: 'Slide 1',
        text: ''
      }];

      return {
        id: `pres-bulk-${itemIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        category: 'Song' as const,
        slides: finalSlides
      } as Presentation;
    }).filter((p): p is Presentation => p !== null);
  }, [bulkText, delimiter, customDelimiter]);

  const activeParsedPresentations = useMemo(() => {
    if (bulkImportTab === 'xml') return parsedFromXmlPresentationsState;
    return bulkImportTab === 'files' ? parsedFromFilePresentationsState : parsedPresentations;
  }, [bulkImportTab, parsedFromFilePresentationsState, parsedPresentations, parsedFromXmlPresentationsState]);

  const handleBulkImportSubmit = () => {
    if (activeParsedPresentations.length === 0) return;
    onAddBulk(activeParsedPresentations);
    setBulkText('');
    setUploadedFiles([]);
    setParsedFromFilePresentationsState([]);
    setXmlUploadedFiles([]);
    setParsedFromXmlPresentationsState([]);
    setShowBulkImport(false);
  };

  return (
    <div className="w-72 border-r border-zinc-900 bg-zinc-950 flex flex-col h-full shrink-0 font-sans select-none" id="left-column">
      <div className="p-4 py-5 border-b border-zinc-900/60 flex items-center justify-between shrink-0 bg-neutral-950">
        <h2 className="text-[12px] font-display font-extrabold uppercase tracking-[0.15em] text-zinc-400">
          Library <span className="text-zinc-600 font-mono text-[10px]">({presentations.length})</span>
        </h2>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
            }}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-lg text-[11px] font-display font-bold tracking-wider text-zinc-300 flex items-center gap-1 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out"
            id="btn-add-item-sidebar"
            title="Add a new single song or slide deck"
          >
            <Plus className="w-4 h-4 text-orange-450" />
            <span className="uppercase">Add</span>
          </button>

          <button
            onClick={() => {
              setShowBulkImport(true);
              setShowAddForm(false);
            }}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-700 rounded-lg text-[11px] font-display font-bold tracking-wider text-emerald-450 hover:text-emerald-300 flex items-center gap-1 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out"
            id="btn-bulk-import-sidebar"
            title="Import multiple songs at once from plain text"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="uppercase">Bulk</span>
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="px-4 py-3 border-b border-zinc-900/60 shrink-0 bg-neutral-950/40 space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 hover:bg-zinc-900/80 focus:bg-zinc-950 border border-zinc-900 hover:border-zinc-850 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/40 rounded-xl px-3 py-1.5 pl-9 text-xs text-zinc-200 focus:outline-none font-sans placeholder-zinc-500 transition-all duration-300 shadow-inner animate-fade-in"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          {tempSearchQuery && (
            <button
              onClick={() => {
                setTempSearchQuery('');
                setSearchQuery('');
              }}
              className="absolute right-3 top-2 text-[10px] text-zinc-500 hover:text-zinc-355 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
          <span className="text-zinc-550 uppercase font-extrabold tracking-widest text-[8px]">Sort Order</span>
          <div className="flex items-center gap-1 bg-black/45 p-0.5 rounded-lg border border-zinc-900">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                sortBy === 'newest' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15' : 'text-zinc-550 hover:text-zinc-350'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('alphabetical')}
              className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer ${
                sortBy === 'alphabetical' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15' : 'text-zinc-550 hover:text-zinc-350'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>


      </div>

      {/* Add Item */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-3.5 border-b border-zinc-900 bg-zinc-900/30 space-y-2.5 animate-fade-in shrink-0 rounded-xl m-2 border border-zinc-850 shadow-lg">
          <input
            type="text"
            placeholder="Item title (e.g., Amen Chorus)"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 focus:border-orange-500/65 focus:ring-1 focus:ring-orange-500/35 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-sans transition-all"
            autoFocus
          />
          <div className="flex justify-end gap-1.5 text-[10px] font-sans">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-transparent rounded-md text-zinc-400 hover:text-zinc-250 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md shadow-orange-950/20"
            >
              Create
            </button>
          </div>
        </form>
      )}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2" 
        id="presentation-list-container"
        onScroll={handleScroll}
      >
        {filteredPresentations.length === 0 ? (
          <div className="p-4 text-center text-zinc-600 text-xs italic">
            {searchQuery ? 'No match found for search query.' : 'No items in library list. Click Add or Bulk to create some.'}
          </div>
        ) : (
          visiblePresentations.map((p) => {
            const isActive = activePresentationId === p.id;
            const isEditing = editingId === p.id;

            return (
              <div key={p.id} className="space-y-1">
                <div
                  onClick={() => !isEditing && onSelect(p.id)}
                  className={`group flex items-center justify-between text-left rounded-xl transition-all duration-300 px-3 py-2.5 cursor-pointer border ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-700 ring-1 ring-orange-500/30 text-white shadow-lg shadow-black/40 font-semibold'
                      : 'bg-zinc-950/25 hover:bg-zinc-900/40 hover:text-zinc-200 border-transparent text-zinc-450'
                  }`}
                  id={`item-row-${p.id}`}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddToSetlist) {
                          onAddToSetlist(p);
                        }
                      }}
                      className={`p-1.5 rounded-lg border transition-all duration-300 cursor-pointer shadow-sm active:scale-90 shrink-0 ${
                        isActive 
                          ? 'bg-orange-500 hover:bg-orange-600 border-orange-400 text-white' 
                          : 'bg-zinc-900 hover:bg-orange-500/10 hover:border-orange-500/25 text-zinc-450 hover:text-orange-400'
                      }`}
                      title="Add to Setlist queue"
                      id={`btn-add-setlist-${p.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {isEditing ? (
                      <form
                        onSubmit={(e) => saveRename(p.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-black text-[11px] text-white border border-zinc-800 rounded px-1.5 py-0.5 focus:outline-none w-full font-sans"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:bg-zinc-805 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs whitespace-normal break-words leading-tight tracking-wide ${isActive ? 'text-zinc-100 font-bold' : 'text-zinc-400'}`}>
                          {highlightText(p.title)}
                        </p>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                          {p.slides.length} slides
                        </span>
                        {matchPreviews[p.id] && (
                          <p className="text-[10px] text-zinc-400 italic leading-tight mt-1 truncate">
                            {highlightText(matchPreviews[p.id])}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                              {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-1 transition-all z-10 shrink-0">
                      <button
                        onClick={(e) => startEditing(p, e)}
                        className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-200 rounded transition-colors"
                        title="Rename item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(p.id);
                        }}
                        className="p-1 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3.5 bg-neutral-950 border-t border-zinc-900 text-[10px] font-mono text-zinc-600 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>Ready</span>
        <span className="text-zinc-500 font-bold uppercase tracking-wider">v1.2.0</span>
      </div>

      {showBulkImport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 text-sans select-text">
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col hover:border-zinc-800 transition-all shadow-2xl overflow-hidden animate-fade-in" id="bulk-importer-modal">
            
            {/* Title bar */}
            <div className="p-5 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                  <Upload className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-zinc-100 uppercase font-sans flex items-center gap-2">
                    <span>DALYRIC Song Importer</span>
                    <span className="text-[9px] bg-orange-950 border border-orange-500/30 text-orange-400 rounded px-2 py-0.5 font-mono select-none">
                      TXT & XML Engine
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">
                    Import songs from TXT, XML (OpenSong/OpenLP), or paste raw lyrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkText('');
                  setUploadedFiles([]);
                  setXmlUploadedFiles([]);
                  setParsedFromXmlPresentationsState([]);
                }}
                className="text-zinc-400 hover:text-white font-mono text-sm p-1.5 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
                id="btn-close-bulk-modal"
              >
                ✕
              </button>
            </div>

            {/* Tab bar */}
            <div className="px-5 bg-zinc-950/60 border-b border-zinc-900 flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setBulkImportTab('files')}
                  className={`py-3 px-1 text-xs font-mono font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    bulkImportTab === 'files' ? 'text-orange-400 font-black' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-import-files"
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-3.5 h-3.5" />
                    Upload .TXT Files ({uploadedFiles.length})
                  </span>
                  {bulkImportTab === 'files' && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setBulkImportTab('paste')}
                  className={`py-3 px-1 text-xs font-mono font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    bulkImportTab === 'paste' ? 'text-orange-400 font-black' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-import-paste"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Paste Raw Lyrics
                  </span>
                  {bulkImportTab === 'paste' && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setBulkImportTab('xml')}
                  className={`py-3 px-1 text-xs font-mono font-bold uppercase tracking-wider relative transition-all cursor-pointer ${
                    bulkImportTab === 'xml' ? 'text-orange-400 font-black' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-import-xml"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Import XML Songs ({xmlUploadedFiles.length})
                  </span>
                  {bulkImportTab === 'xml' && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              </div>

              {/* Delimiter */}
              <div className="flex items-center gap-2 text-xs py-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Song Delimiter:</span>
                <button
                  type="button"
                  onClick={() => setDelimiter('triple-hyphen')}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold border rounded-lg transition-all ${
                    delimiter === 'triple-hyphen'
                      ? 'bg-orange-600/10 border-orange-500/40 text-orange-400'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Dashes (---)
                </button>
                <button
                  type="button"
                  onClick={() => setDelimiter('custom')}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold border rounded-lg transition-all ${
                    delimiter === 'custom'
                      ? 'bg-orange-600/10 border-orange-500/40 text-orange-400'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Custom
                </button>
                {delimiter === 'custom' && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    className="bg-black border border-zinc-850 py-0.5 px-2 rounded-md text-[9px] font-mono text-orange-400 focus:outline-none w-16"
                  />
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col lg:flex-row gap-5 min-h-0 bg-zinc-950/40">
              
              {/* Left side */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 space-y-4">
                              {bulkImportTab === 'xml' ? (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    {isXmlImporting ? (
                      <div className="flex-1 border border-zinc-850 rounded-2xl p-6 bg-zinc-900/10 flex flex-col items-center justify-center text-center min-h-[180px] animate-fade-in shadow-inner">
                        <FileText className="w-8 h-8 text-orange-400 animate-bounce mb-3.5" />
                        <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest leading-none mb-2">
                          Parsing XML Songs...
                        </h4>
                        <div className="w-full max-w-xs bg-zinc-900 border border-zinc-850 rounded-full h-2 overflow-hidden mb-3">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-150" 
                            style={{ width: `${(xmlImportProgress.current / xmlImportProgress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Parsed {xmlImportProgress.current.toLocaleString()} / {xmlImportProgress.total.toLocaleString()} files
                        </p>
                        <p className="text-[9px] text-zinc-650 font-sans mt-2.5 max-w-xs leading-normal">
                          Supports OpenSong, OpenLP, and standard XML worship song formats.
                        </p>
                      </div>
                    ) : (
                      <div
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleXmlDrop}
                        className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[180px] relative cursor-pointer ${
                          dragActive
                            ? 'border-orange-500 bg-orange-600/5'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/20'
                        }`}
                        onClick={() => document.getElementById('xml-file-selector')?.click()}
                      >
                        <input
                          type="file"
                          id="xml-file-selector"
                          multiple
                          accept=".xml,text/xml,application/xml"
                          className="hidden"
                          onChange={(e) => { if (e.target.files) handleXmlFiles(e.target.files); }}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3 shadow-md shadow-black/45 text-orange-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest leading-none mb-1.5">
                          Drop XML Song Files Here
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-4">
                          Supports OpenSong, OpenLP, and standard worship XML formats.
                        </p>
                        <div className="text-[9px] font-mono text-zinc-650 uppercase bg-black/40 px-2.5 py-1 rounded-md border border-zinc-900/50">
                          Each .xml file = one song
                        </div>
                      </div>
                    )}

                    {xmlUploadedFiles.length > 0 && (
                      <div className="flex-[1.2] flex flex-col min-h-0 border border-zinc-900 bg-black/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                            Parsed Song Files ({xmlUploadedFiles.length.toLocaleString()})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setXmlUploadedFiles([]);
                              setParsedFromXmlPresentationsState([]);
                            }}
                            className="text-[9px] font-mono text-rose-500 hover:text-rose-400 uppercase font-bold"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] custom-scrollbar pr-1">
                          {xmlUploadedFiles.map((file, index) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-2 bg-zinc-900/40 hover:bg-zinc-905 border border-zinc-900 rounded-xl transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 bg-orange-950/20 text-orange-400 rounded-lg border border-orange-900/10">
                                  <FileText className="w-3 h-3" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-350 truncate leading-tight">{file.name}</p>
                                  <p className="text-[9px] font-mono text-zinc-550 uppercase mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeXmlFile(file.id, index)}
                                className="p-1 text-zinc-650 hover:text-rose-450 rounded-md transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : bulkImportTab === 'files' ? (
                  <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    
                    {isImporting ? (
                      <div className="flex-1 border border-zinc-850 rounded-2xl p-6 bg-zinc-900/10 flex flex-col items-center justify-center text-center min-h-[180px] animate-fade-in shadow-inner">
                        <Upload className="w-8 h-8 text-orange-400 animate-bounce mb-3.5" />
                        <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest leading-none mb-2">
                          Compiling Lyrics Catalog...
                        </h4>
                        <div className="w-full max-w-xs bg-zinc-900 border border-zinc-850 rounded-full h-2 overflow-hidden mb-3">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-150" 
                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          Parsed {importProgress.current.toLocaleString()} / {importProgress.total.toLocaleString()} files ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                        </p>
                        <p className="text-[9px] text-zinc-650 font-sans mt-2.5 max-w-xs leading-normal">
                          Running as lightweight chunks to allow system thread responsiveness during heavy data ingestion.
                        </p>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[180px] relative cursor-pointer ${
                          dragActive
                            ? 'border-orange-500 bg-orange-600/5'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/20'
                        }`}
                        onClick={() => document.getElementById('local-file-selector')?.click()}
                        id="file-dropzone-target"
                      >
                        <input
                          type="file"
                          id="local-file-selector"
                          multiple
                          accept=".txt,text/plain"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mb-3 shadow-md shadow-black/45 text-orange-400 group-hover:scale-105 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest leading-none mb-1.5">
                          Drag & Drop local `.txt` song files here
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm leading-relaxed mb-4">
                          or click to browse your desktop storage. You can select lakhs of files at once.
                        </p>
                        <div className="text-[9px] font-mono text-zinc-650 uppercase bg-black/40 px-2.5 py-1 rounded-md border border-zinc-900/50">
                          Supports UTF-8 encoded plain text songs
                        </div>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="flex-[1.2] flex flex-col min-h-0 border border-zinc-900 bg-black/20 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                            Uploaded Files ({uploadedFiles.length.toLocaleString()})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFiles([]);
                              setParsedFromFilePresentationsState([]);
                            }}
                            className="text-[9px] font-mono text-rose-500 hover:text-rose-400 uppercase font-bold"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] custom-scrollbar pr-1">
                          {uploadedFiles.slice(0, 80).map((file) => {
                            return (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 bg-zinc-900/40 hover:bg-zinc-905 border border-zinc-900 rounded-xl transition-all"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-1.5 bg-orange-950/20 text-orange-400 rounded-lg border border-orange-900/10">
                                    <Music className="w-3 h-3" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-350 truncate leading-tight">
                                      {file.name}
                                    </p>
                                    <p className="text-[9px] font-mono text-zinc-550 uppercase mt-0.5">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeUploadedFile(file.id);
                                  }}
                                  className="p-1 text-zinc-650 hover:text-rose-450 rounded-md transition-colors"
                                  title="Remove file"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                          {uploadedFiles.length > 80 && (
                            <div className="p-2 bg-zinc-950/20 text-center border border-zinc-900 border-dashed rounded-xl text-zinc-550 font-mono text-[9px] uppercase tracking-wider">
                              + {(uploadedFiles.length - 80).toLocaleString()} more files enqueued in buffer
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-[300px] space-y-2">
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                        Paste songs plain boundaries lyrics block
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkText(`Amazing Grace
[Verse 1]
Amazing grace how sweet the sound
That saved a wretch like me!

[Chorus]
My chains are gone
I've been set free

---
Rock of Ages
[Verse 1]
Rock of ages cleft for me
Let me hide myself in thee`);
                        }}
                        className="text-[9px] text-orange-400 hover:text-orange-300 underline font-mono font-bold"
                      >
                        Insert Sample Demo Text
                      </button>
                    </div>

                    <textarea
                      placeholder="Paste song lyrics here...&#10;First line of each block represents the Song Title&#10;Slides split on blank lines&#10;Use '---' on an empty line between separate songs."
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="flex-1 w-full bg-black/60 border border-zinc-850 rounded-xl p-4 text-xs text-zinc-300 font-mono focus:outline-none focus:border-orange-500 resize-none overflow-y-auto custom-scrollbar leading-relaxed"
                    />
                  </div>
                )}

              </div>

              {/* Preview */}
              <div className="w-full lg:w-72 flex flex-col min-h-0 rounded-2xl border border-zinc-900 bg-zinc-900/10 p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Parser Compiler Engine
                  </span>
                  <span className="text-[9.5px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded-md">
                    {activeParsedPresentations.length} Detected
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[300px] lg:max-h-full custom-scrollbar pr-1">
                  {activeParsedPresentations.length === 0 ? (
                    <div className="text-zinc-650 text-[10px] italic text-center py-20 font-sans">
                      Waiting for file upload or text inputs to compile live preview deck...
                    </div>
                  ) : (
                    <>
                      {activeParsedPresentations.slice(0, 80).map((p, idx) => (
                        <div 
                          key={idx}
                          className="bg-black/60 border border-zinc-900 rounded-xl p-3 text-left hover:border-zinc-850 transition-colors animate-fade-in"
                        >
                          <p className="text-[11.5px] font-bold text-zinc-200 truncate leading-tight">
                            {p.title}
                          </p>
                          <div className="flex items-center justify-between mt-1.5 text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest font-bold">
                            <span>{p.slides.length} slides segment</span>
                            <span className="text-zinc-600 font-black">#{idx + 1}</span>
                          </div>
                          {p.slides[0]?.text && (
                            <p className="text-[9px] text-zinc-500 truncate italic mt-1.5 font-sans border-t border-zinc-900/40 pt-1.5">
                              "{p.slides[0].text}"
                            </p>
                          )}
                        </div>
                      ))}
                      {activeParsedPresentations.length > 80 && (
                        <div className="p-3 bg-zinc-950/20 text-center border border-zinc-900 border-dashed rounded-xl text-zinc-550 font-mono text-[9px] uppercase tracking-wider">
                          + {(activeParsedPresentations.length - 80).toLocaleString()} more songs compiled in active buffer memory
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900/80 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkText('');
                  setUploadedFiles([]);
                  setXmlUploadedFiles([]);
                  setParsedFromXmlPresentationsState([]);
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                disabled={activeParsedPresentations.length === 0}
                className={`px-5 py-2 rounded-xl text-xs font-sans font-bold transition-all flex items-center gap-2 ${
                  activeParsedPresentations.length > 0
                    ? 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer hover:shadow-lg shadow-orange-950/20 border border-orange-500/20'
                    : 'bg-zinc-900 text-zinc-650 border border-zinc-850 cursor-not-allowed'
                }`}
                id="btn-import-finalize"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import {activeParsedPresentations.length} Songs Decks</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default memo(PresentationList);
