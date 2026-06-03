import React, { useState, useEffect, useMemo, useRef } from "react";
import { Presentation, Slide } from "./types";
import { INITIAL_PRESENTATIONS } from "./data";
import PresentationList from "./components/PresentationList";
import { getPresentations, savePresentations } from "./lib/db";
import WorkspaceEditor from "./components/WorkspaceEditor";
import FullscreenProjection from "./components/FullscreenProjection";
import LiveMonitor from "./components/LiveMonitor";
import BiblePanel from "./components/BiblePanel";
import MobileRemote from "./components/MobileRemote";
import { BookOpen, Music, Sparkles, Monitor } from "lucide-react";

export function safeSaveLocalStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); }
  catch (e) { console.warn("LocalStorage fail: " + key, e); }
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isProjectionMode, setIsProjectionMode] = useState(() => window.location.hash === "#projection");
  const [isRemoteMode, setIsRemoteMode] = useState(() => window.location.hash === "#remote");

  useEffect(() => {
    const handleHashChange = () => {
      setIsProjectionMode(window.location.hash === "#projection");
      setIsRemoteMode(window.location.hash === "#remote");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (isRemoteMode) return <MobileRemote />;
  if (isProjectionMode) return <FullscreenProjection />;

  const [presentations, setPresentations] = useState<Presentation[]>(() => INITIAL_PRESENTATIONS);
  const hasRestored = useRef(false);

  useEffect(() => {
    async function restoreFromIndexedDB() {
      try {
        const stored = await getPresentations();
        if (stored && stored.length > 0) setPresentations(stored);
      } catch (err) { console.error("Failed to load from IndexedDB:", err); }
      finally { hasRestored.current = true; }
    }
    restoreFromIndexedDB();
  }, []);

  const [activePresentationId, setActivePresentationId] = useState<string | null>(() => {
    const saved = localStorage.getItem("ultra_minimal_active_id");
    return saved || (INITIAL_PRESENTATIONS.length > 0 ? INITIAL_PRESENTATIONS[0].id : null);
  });

  const [setlist, setSetlist] = useState<{ uniqueId: string; presentationId: string; title: string }[]>(() => {
    try { const s = localStorage.getItem("lyrics_setlist"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => { safeSaveLocalStorage("lyrics_setlist", JSON.stringify(setlist)); }, [setlist]);

  const [bibleActiveBookId, setBibleActiveBookId] = useState("GEN");
  const [bibleActiveChapter, setBibleActiveChapter] = useState(1);
  const [bibleActiveVerse, setBibleActiveVerse] = useState(1);

  const [bibleHistory, setBibleHistory] = useState<{ bookId: string; bookName: string; chapter: number; verse: number }[]>(() => {
    try { const s = localStorage.getItem("bible_history"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => { safeSaveLocalStorage("bible_history", JSON.stringify(bibleHistory)); }, [bibleHistory]);

  const [bibleSavedVerses, setBibleSavedVerses] = useState<{ bookId: string; bookName: string; chapter: number; verse: number; primaryText: string; refText?: string }[]>(() => {
    try { const s = localStorage.getItem("bible_saved_verses"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => { safeSaveLocalStorage("bible_saved_verses", JSON.stringify(bibleSavedVerses)); }, [bibleSavedVerses]);

  const handleVerseSelected = (bookId: string, bookName: string, chapter: number, verse: number) => {
    setBibleHistory(prev => [{ bookId, bookName, chapter, verse }, ...prev.filter(i => !(i.bookId === bookId && i.chapter === chapter && i.verse === verse))].slice(0, 20));
  };

  const handleToggleSaveVerse = (bookId: string, bookName: string, chapter: number, verse: number, primaryText: string, refText?: string) => {
    setBibleSavedVerses(prev => {
      const exists = prev.some(i => i.bookId === bookId && i.chapter === chapter && i.verse === verse);
      return exists ? prev.filter(i => !(i.bookId === bookId && i.chapter === chapter && i.verse === verse)) : [...prev, { bookId, bookName, chapter, verse, primaryText, refText }];
    });
  };

  const handleRemoveSavedVerse = (bookId: string, chapter: number, verse: number) => {
    setBibleSavedVerses(prev => prev.filter(i => !(i.bookId === bookId && i.chapter === chapter && i.verse === verse)));
  };

  const handleJumpToVerse = (bookId: string, chapter: number, verse: number) => {
    setBibleActiveBookId(bookId); setBibleActiveChapter(chapter); setBibleActiveVerse(verse);
  };

  const handleAddToSetlist = (presentation: any) => {
    setSetlist(prev => [...prev, { uniqueId: presentation.id + "-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9), presentationId: presentation.id, title: presentation.title }]);
  };
  const handleRemoveFromSetlist = (uniqueId: string) => setSetlist(prev => prev.filter(i => i.uniqueId !== uniqueId));

  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [isTextCleared, setIsTextCleared] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isLowerThird, setIsLowerThird] = useState(false);
  const [liveCaptionText, setLiveCaptionText] = useState("");

  const [activeMode, setActiveMode] = useState<"SONGS" | "BIBLE">("SONGS");
  const [bibleProjectionText, setBibleProjectionText] = useState<string | null>(null);
  const [bibleReferenceText, setBibleReferenceText] = useState("");

  const [biblePrimaryTranslation, setBiblePrimaryTranslation] = useState(() => localStorage.getItem("bible_primary_translation") || "NONE");
  const [bibleReferenceTranslation, setBibleReferenceTranslation] = useState(() => localStorage.getItem("bible_reference_translation") || "NONE");
  const [bibleDescStyle, setBibleDescStyle] = useState(() => localStorage.getItem("bible_desc_style") || "bilingual");
  const [bibleDescSeparator, setBibleDescSeparator] = useState(() => localStorage.getItem("bible_desc_separator") || ":");
  const [bibleDescShowVersion, setBibleDescShowVersion] = useState(() => { const v = localStorage.getItem("bible_desc_show_version"); return v === null ? true : v === "true"; });
  const [bibleDescAlignment, setBibleDescAlignment] = useState(() => localStorage.getItem("bible_desc_alignment") || "inherited");
  const [bibleDescLineHeight, setBibleDescLineHeight] = useState(() => { const v = localStorage.getItem("bible_desc_line_height"); return v ? parseInt(v, 10) : 8; });
  const [bibleDescPosition, setBibleDescPosition] = useState(() => localStorage.getItem("bible_desc_position") || "top_separate");
  const [biblePaginationEnabled, setBiblePaginationEnabled] = useState(() => localStorage.getItem("bible_pagination_enabled") === "true");
  const [bibleHeadingFontSize, setBibleHeadingFontSize] = useState(() => { const s = localStorage.getItem("bible_heading_font_size"); return s ? Number(s) : 36; });
  const [bibleHeadingFontColor, setBibleHeadingFontColor] = useState(() => localStorage.getItem("bible_heading_font_color") || "#ffffff");
  const [bibleHeadingBgColor, setBibleHeadingBgColor] = useState(() => localStorage.getItem("bible_heading_bg_color") || "#0a0a0a");
  const [bibleHeadingBgOpacity, setBibleHeadingBgOpacity] = useState(() => { const s = localStorage.getItem("bible_heading_bg_opacity"); return s !== null ? Number(s) : 60; });
  const [bibleVerseFontSize, setBibleVerseFontSize] = useState(() => { const s = localStorage.getItem("bible_verse_font_size"); return s ? Number(s) : 56; });
  const [bibleVerseFontColor, setBibleVerseFontColor] = useState(() => localStorage.getItem("bible_verse_font_color") || "#fac105");
  const [bibleVerseBgColor, setBibleVerseBgColor] = useState(() => localStorage.getItem("bible_verse_bg_color") || "#050505");
  const [bibleVerseBgOpacity, setBibleVerseBgOpacity] = useState(() => { const s = localStorage.getItem("bible_verse_bg_opacity"); return s !== null ? Number(s) : 0; });

  const wsRef = useRef<WebSocket | null>(null);
  const [remoteConnectionCount, setRemoteConnectionCount] = useState(0);
  const [isLivePanelOpen, setIsLivePanelOpen] = useState(false);

  const wsStateRef = useRef({ presentations: [] as Presentation[], activePresentation: null as Presentation | null, activePresentationForModes: null as Presentation | null, activePresentationId: null as string | null, activeSlideIndex: null as number | null, bibleProjectionText: null as string | null, bibleReferenceText: "" as string, bibleSlides: [] as Slide[], activeMode: "SONGS" as "SONGS" | "BIBLE" });
  useEffect(() => { wsStateRef.current = { presentations, activePresentation, activePresentationForModes, activePresentationId, activeSlideIndex, bibleProjectionText, bibleReferenceText, bibleSlides, activeMode }; });

  useEffect(() => {
    const save = (k: string, v: string) => safeSaveLocalStorage(k, v);
    save("bible_heading_font_size", String(bibleHeadingFontSize));
    save("bible_heading_font_color", bibleHeadingFontColor);
    save("bible_heading_bg_color", bibleHeadingBgColor);
    save("bible_heading_bg_opacity", String(bibleHeadingBgOpacity));
    save("bible_verse_font_size", String(bibleVerseFontSize));
    save("bible_verse_font_color", bibleVerseFontColor);
    save("bible_verse_bg_color", bibleVerseBgColor);
    save("bible_verse_bg_opacity", String(bibleVerseBgOpacity));
    save("bible_primary_translation", biblePrimaryTranslation);
    save("bible_reference_translation", bibleReferenceTranslation);
    save("bible_desc_style", bibleDescStyle);
    save("bible_desc_separator", bibleDescSeparator);
    save("bible_desc_show_version", String(bibleDescShowVersion));
    save("bible_desc_alignment", bibleDescAlignment);
    save("bible_desc_line_height", String(bibleDescLineHeight));
    save("bible_desc_position", bibleDescPosition);
    save("bible_pagination_enabled", String(biblePaginationEnabled));
  });

  const activePresentation = useMemo(() => {
    if (!activePresentationId) return null;
    return presentations.find(p => p.id === activePresentationId) || null;
  }, [presentations, activePresentationId]);

  const bibleSlides = useMemo(() => {
    if (!bibleProjectionText) return [];
    return bibleProjectionText.split(/\[Slide \d+\]\r?\n?/i).filter(Boolean).map((part, i) => ({
      id: "bible-slide-" + (i + 1),
      label: "Slide " + (i + 1),
      text: part.trim()
    }));
  }, [bibleProjectionText]);

  const activeSlide = useMemo(() => {
    if (activeMode === "BIBLE") {
      if (bibleSlides.length === 0) return null;
      return bibleSlides[activeSlideIndex !== null ? Math.min(activeSlideIndex, bibleSlides.length - 1) : 0] || null;
    }
    return activePresentation && activeSlideIndex !== null ? activePresentation.slides[activeSlideIndex] || null : null;
  }, [activeMode, bibleSlides, activePresentation, activeSlideIndex]);

  const isDisplayingText = activeSlide && !isTextCleared && !isBlackout;

  const activePresentationForModes = useMemo(() => {
    if (activeMode === "BIBLE") return { id: "bible-proj", title: bibleReferenceText || "Bible", category: "Song" as any, copyright: bibleReferenceText, slides: bibleSlides };
    return activePresentation;
  }, [activeMode, activePresentation, bibleSlides, bibleReferenceText]);

  const projectionPacket = useMemo(() => ({
    text: isBlackout ? "" : isTextCleared ? "" : (activeSlide ? activeSlide.text : ""),
    isBlackout, isTextCleared, isLowerThird,
    copyright: activeMode === "BIBLE" ? bibleReferenceText : (isDisplayingText && activePresentation?.copyright ? activePresentation.copyright : ""),
    bibleDescPosition: activeMode === "BIBLE" ? bibleDescPosition : "bottom_separate",
    bibleVerseFontSize, bibleVerseFontColor, bibleHeadingFontSize, bibleHeadingFontColor,
    liveCaptionText,
  }), [activeSlide, isBlackout, isTextCleared, isLowerThird, activePresentation, isDisplayingText, activeMode, bibleReferenceText, bibleDescPosition, bibleVerseFontSize, bibleVerseFontColor, bibleHeadingFontSize, bibleHeadingFontColor, liveCaptionText]);

  useEffect(() => {
    safeSaveLocalStorage("lyrics_last_projection_packet", JSON.stringify(projectionPacket));
    try { new BroadcastChannel("lyrics_projection_channel").postMessage(projectionPacket); } catch (e) {}
  }, [projectionPacket]);

  useEffect(() => {
    const channel = new BroadcastChannel("lyrics_remote_channel");
    channel.onmessage = (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;
      if (msg.type === "NEXT_SLIDE") {
        setActiveSlideIndex(prev => { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (!d || d.slides.length === 0) return prev; if (prev === null) return 0; return Math.min(prev + 1, d.slides.length - 1); });
        setIsTextCleared(false); setIsBlackout(false);
      } else if (msg.type === "PREV_SLIDE") {
        setActiveSlideIndex(prev => { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (!d || d.slides.length === 0) return prev; if (prev === null || prev === 0) return 0; return prev - 1; });
        setIsTextCleared(false); setIsBlackout(false);
      } else if (msg.type === "TOGGLE_CLEAR") { setIsTextCleared(p => !p); }
      else if (msg.type === "TOGGLE_BLACKOUT") { setIsBlackout(p => !p); }
      else if (msg.type === "FORCE_CLEAR") { setIsTextCleared(msg.value); }
      else if (msg.type === "FORCE_BLACKOUT") { setIsBlackout(msg.value); }
    };
    return () => channel.close();
  }, [activePresentation, activePresentationForModes, activeMode, projectionPacket]);

  // WebSocket
  useEffect(() => {
    let socket, timeout;
    const connect = () => {
      socket = new WebSocket("ws://127.0.0.1:3002");
      wsRef.current = socket;
      socket.onopen = () => { socket.send(JSON.stringify({ type: "DESKTOP_REGISTER" })); socket.send(JSON.stringify({ type: "UPDATE_PIN", pin: localStorage.getItem("remote_pin") || "1234" })); };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const s = wsStateRef.current;
          if (data.type === "CONNECTION_COUNT") setRemoteConnectionCount(data.count);
          else if (data.type === "SLIDE_NEXT") { const d = s.activeMode === "BIBLE" ? s.activePresentationForModes : s.activePresentation; setActiveSlideIndex(p => { if (!d || d.slides.length === 0) return p; if (p === null) return 0; return Math.min(p + 1, d.slides.length - 1); }); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "SLIDE_PREV") { const d = s.activeMode === "BIBLE" ? s.activePresentationForModes : s.activePresentation; setActiveSlideIndex(p => { if (!d || d.slides.length === 0) return p; if (p === null || p === 0) return 0; return p - 1; }); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "SLIDE_GOTO") h.selectSlide(data.index);
          else if (data.type === "BLACK_SCREEN") setIsBlackout(data.active);
          else if (data.type === "CLEAR_SCREEN") setIsTextCleared(p => !p);
          else if (data.type === "SONG_SELECT") { h.selectPres(data.songId); setActiveMode("SONGS"); }
          else if (data.type === "SONG_SECTION_GOTO") h.selectSlide(data.sectionIndex);
          else if (data.type === "SONG_SEARCH") {
            const q = (data.query || "").toLowerCase();
            socket.send(JSON.stringify({ type: "SONG_LIST", songs: s.presentations.filter(p => p.title.toLowerCase().includes(q)).map(p => ({ id: p.id, title: p.title, artist: p.folder || "Song", ccli: p.copyright || "", sections: p.slides.map((sl, i) => ({ label: sl.label || ("Slide " + (i + 1)), text: sl.text })) })) }));
          } else if (data.type === "SCRIPTURE_INSERT") { setBibleProjectionText(data.text); setBibleReferenceText(data.bookName + " " + data.chapter + ":" + data.verse); setActiveSlideIndex(0); setActiveMode("BIBLE"); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "LOWER_THIRD_SHOW") setIsLowerThird(true);
          else if (data.type === "LOWER_THIRD_HIDE") setIsLowerThird(false);
        } catch (e) { console.error("[WS Error]", e); }
      };
      socket.onclose = () => timeout = setTimeout(connect, 3000);
      socket.onerror = () => socket.close();
    };
    connect();
    return () => { if (socket) socket.close(); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({
      type: "STATE_SYNC",
      state: {
        currentSlide: { text: activeSlide ? activeSlide.text : "", reference: activeMode === "BIBLE" ? bibleReferenceText : (activePresentation?.title || ""), type: activeMode === "BIBLE" ? "scripture" : "lyric", index: activeSlideIndex || 0, total: activeMode === "BIBLE" ? bibleSlides.length : (activePresentation?.slides.length || 1) },
        isBlackScreen: isBlackout, isTextCleared, currentSongId: activePresentation?.id || null, currentSongTitle: activePresentation?.title || null, currentSectionIndex: activeSlideIndex || 0, lowerThirdVisible: isLowerThird, masterVolume: 75, stageMessage: ""
      }
    }));
  }, [activeSlide, activeSlideIndex, activeMode, bibleReferenceText, activePresentation, bibleSlides, isBlackout, isTextCleared, isLowerThird]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
      const k = e.key;
      if (k.toLowerCase() === "c") { setIsTextCleared(p => !p); e.preventDefault(); }
      else if (k === "Escape") { setIsBlackout(p => !p); e.preventDefault(); }
      else if (k === "ArrowRight" || k === "ArrowDown") { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (d && d.slides.length > 0) { setActiveSlideIndex(p => p === null ? 0 : Math.min(p + 1, d.slides.length - 1)); setIsTextCleared(false); setIsBlackout(false); e.preventDefault(); } }
      else if (k === "ArrowLeft" || k === "ArrowUp") { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (d && d.slides.length > 0) { setActiveSlideIndex(p => p === null || p === 0 ? 0 : p - 1); setIsTextCleared(false); setIsBlackout(false); e.preventDefault(); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activePresentation, activePresentationForModes, activeMode]);

  useEffect(() => { if (hasRestored.current) savePresentations(presentations).catch(() => {}); }, [presentations]);
  useEffect(() => { if (activePresentationId) safeSaveLocalStorage("ultra_minimal_active_id", activePresentationId); else try { localStorage.removeItem("ultra_minimal_active_id"); } catch (e) {} }, [activePresentationId]);

  const h = {
    selectPres: (id: string) => { setActivePresentationId(id); setActiveSlideIndex(null); },
    selectSlide: (index: number) => { setActiveSlideIndex(index); setIsTextCleared(false); setIsBlackout(false); },
    addPres: (title: string) => {
      const id = "pres-" + Date.now();
      setPresentations(p => [...p, { id, title, category: "Song", slides: [{ id: "slide-1-" + Date.now(), label: "Slide 1", text: "Welcome to your new deck.\nType lyrics or headers here.\nDouble-newline splits pages!" }] }]);
      setActivePresentationId(id); setActiveSlideIndex(null);
    },
    addBulk: (newPres: Presentation[]) => { if (newPres.length === 0) return; setPresentations(p => [...p, ...newPres]); setActivePresentationId(newPres[0].id); setActiveSlideIndex(0); },
    deletePres: (id: string) => { const r = presentations.filter(p => p.id !== id); setPresentations(r); if (activePresentationId === id) { setActivePresentationId(r.length > 0 ? r[0].id : null); setActiveSlideIndex(null); } },
    deleteMultiple: (ids: string[]) => { const s = new Set(ids); const r = presentations.filter(p => !s.has(p.id)); setPresentations(r); if (activePresentationId && s.has(activePresentationId)) { setActivePresentationId(r.length > 0 ? r[0].id : null); setActiveSlideIndex(null); } },
    renamePres: (id: string, title: string) => setPresentations(p => p.map(x => x.id === id ? { ...x, title } : x)),
    changeFolder: (id: string, folder: string | undefined) => setPresentations(p => p.map(x => x.id === id ? { ...x, folder: folder || undefined } : x)),
    updatePres: (updated: Presentation) => setPresentations(p => p.map(x => x.id === updated.id ? updated : x)),
    projectToTV: async () => {
      const url = window.location.origin + window.location.pathname + "#projection";
      let left = 0, top = 0, w = 1024, h = 576, targeted = false;
      const win = window as any;
      if (win.getScreenDetails) {
        try {
          const sd = await Promise.race([win.getScreenDetails(), new Promise(r => setTimeout(() => r(null), 5000))]);
          if (sd) {
            const ext = sd.screens.find((s: any) => s.isInternal === false || s.isExtended === true);
            if (ext) { left = ext.availLeft ?? ext.left ?? 0; top = ext.availTop ?? ext.top ?? 0; w = ext.availWidth ?? ext.width ?? 1024; h = ext.availHeight ?? ext.height ?? 576; targeted = true; }
          }
        } catch (e) {}
      }
      if (!targeted) { w = 1024; h = 576; left = (window.screen.width - w) / 2; top = (window.screen.height - h) / 2; }
      try { const popup = window.open(url, "LyricsStageProjectionWindow", "left=" + left + ",top=" + top + ",width=" + w + ",height=" + h + ",menubar=no,status=no,titlebar=no,toolbar=no,scrollbars=no,resizable=yes"); if (popup) popup.focus(); else window.open(url, "_blank"); } catch (e) { window.open(url, "_blank"); }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      <header className="px-6 py-3.5 bg-neutral-950/95 border-b border-zinc-900 flex items-center justify-between shrink-0 shadow-xl shadow-black/10 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-950/40 border border-orange-400/20">
            <Music className="w-4 h-4 text-white" />
            <div className="absolute -top-1 -right-1 bg-zinc-950 text-orange-400 rounded-full p-0.5 border border-orange-500/40">
              <Sparkles className="w-2 h-2 animate-pulse" />
            </div>
          </div>
          <span className="text-base font-display font-bold tracking-[0.2em] leading-none bg-gradient-to-r from-orange-500 via-amber-300 to-white bg-clip-text text-transparent">DALYRIC</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-850/80">
          <button onClick={() => { setActiveMode("SONGS"); setBibleProjectionText(null); }} className={"px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer " + (activeMode === "SONGS" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg shadow-md shadow-orange-950/40 font-extrabold border border-orange-450/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg")}>Songs</button>
          <button onClick={() => setActiveMode("BIBLE")} className={"px-4 py-1.5 flex items-center gap-1.5 text-[11px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer " + (activeMode === "BIBLE" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg shadow-md shadow-orange-950/40 font-extrabold border border-orange-450/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg")}><BookOpen className="w-3.5 h-3.5 text-orange-200" />Bible</button>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 font-bold">
          <button onClick={() => setIsLivePanelOpen(v => !v)} className={"px-3 py-1.5 flex items-center gap-1.5 text-[11px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer rounded-xl border " + (isLivePanelOpen ? "bg-orange-500/20 text-orange-400 border-orange-500/40" : "bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700")}><Monitor className="w-3.5 h-3.5" />{isLivePanelOpen ? "Live" : "Preview"}</button>
          <span className="bg-zinc-900/80 text-orange-450 px-3 py-1.5 rounded-xl border border-zinc-800/80 font-black text-xs text-orange-400">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </header>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {activeMode === "SONGS" ? (
          <>
            <PresentationList presentations={presentations} activePresentationId={activePresentationId} onSelect={h.selectPres} onAdd={h.addPres} onAddBulk={h.addBulk} onDelete={h.deletePres} onRename={h.renamePres} onAddToSetlist={handleAddToSetlist} onChangeFolder={h.changeFolder} onDeleteMultiple={h.deleteMultiple} />
            <WorkspaceEditor activePresentation={activePresentation} activeSlideIndex={activeSlideIndex} onSelectSlideIndex={h.selectSlide} onUpdatePresentation={h.updatePres} liveCaptionText={liveCaptionText} onUpdateLiveCaptionText={setLiveCaptionText} />
          </>
        ) : (
          <BiblePanel biblePaginationEnabled={biblePaginationEnabled} onProjectText={(t, ref, dp) => { setBibleProjectionText(t); setBibleReferenceText(ref); if (dp) setBibleDescPosition(dp); setActiveSlideIndex(0); setIsTextCleared(false); setIsBlackout(false); }} onClearText={() => setIsTextCleared(p => !p)} isTextCleared={isTextCleared} isBlackout={isBlackout} theme="stage" bibleHeadingFontSize={bibleHeadingFontSize} setBibleHeadingFontSize={setBibleHeadingFontSize} bibleHeadingFontColor={bibleHeadingFontColor} setBibleHeadingFontColor={setBibleHeadingFontColor} bibleHeadingBgColor={bibleHeadingBgColor} setBibleHeadingBgColor={setBibleHeadingBgColor} bibleHeadingBgOpacity={bibleHeadingBgOpacity} setBibleHeadingBgOpacity={setBibleHeadingBgOpacity} bibleVerseFontSize={bibleVerseFontSize} setBibleVerseFontSize={setBibleVerseFontSize} bibleVerseFontColor={bibleVerseFontColor} setBibleVerseFontColor={setBibleVerseFontColor} bibleVerseBgColor={bibleVerseBgColor} setBibleVerseBgColor={setBibleVerseBgColor} bibleVerseBgOpacity={bibleVerseBgOpacity} setBibleVerseBgOpacity={setBibleVerseBgOpacity} savedVerses={bibleSavedVerses} onToggleSaveVerse={handleToggleSaveVerse} onVerseSelected={handleVerseSelected} activeBookId={bibleActiveBookId} setActiveBookId={setBibleActiveBookId} activeChapter={bibleActiveChapter} setActiveChapter={setBibleActiveChapter} activeVerse={bibleActiveVerse} setActiveVerse={setBibleActiveVerse} />
        )}
        {isLivePanelOpen && (
          <LiveMonitor activePresentation={activePresentationForModes} activeSlideIndex={activeMode === "BIBLE" ? (activeSlide ? activeSlideIndex : null) : activeSlideIndex} isTextCleared={isTextCleared} onToggleClearText={() => setIsTextCleared(!isTextCleared)} isBlackout={isBlackout} onToggleBlackout={() => setIsBlackout(!isBlackout)} bibleDescPosition={bibleDescPosition} theme="stage" customBgImage={null} customBgVideo={null} customSolidBgColor="#0a0a0a" isLowerThird={isLowerThird} onToggleLowerThird={() => setIsLowerThird(!isLowerThird)} fontSize={4.2} onProjectToTV={h.projectToTV} fontFamily="Inter" customGoogleFont="" fontColor="#fac105" textAlignment="center" fontStyle="normal" fontWeight="black" lineHeight="normal" letterSpacing="wide" textShadow={true} overlayOpacity={0} overlayColor="#000000" letterSpacingPx={2} lineHeightVal={1.30} textShadowX={0} textShadowY={4} textShadowBlur={16} textShadowColor="#000000" textStrokeWidth={0} textStrokeColor="#000000" allCapsEnabled={false} titleCasingEnabled={false} safeMarginTop={4} safeMarginBottom={4} safeMarginLeft={4} safeMarginRight={4} verticalAlignment="middle" textGradientEnabled={false} textGradientStart="#ffa500" textGradientEnd="#ff0055" textGradientDirection="to bottom" highlightWordsEnabled={false} highlightWordsList="Jesus, God, Lord, Christ, Yahweh, Holy Spirit, Amen, Saviour" highlightWordsColor="#ffeb3b" activeMode={activeMode} textScalingMode="fit" textBgFill="none" textBgFillColor="#000000" textBgFillOpacity={60} textBgFillGradientStart="#000000" textBgFillGradientEnd="#1a1a1a" textBgFillPadding={12} textBgFillBorderRadius={8} textShadowAngle={135} textShadowDistance={4} textShadowOpacity={90} textOutlineDouble={false} bibleHeadingFontSize={bibleHeadingFontSize} bibleHeadingFontColor={bibleHeadingFontColor} bibleHeadingBgColor={bibleHeadingBgColor} bibleHeadingBgOpacity={bibleHeadingBgOpacity} bibleVerseFontSize={bibleVerseFontSize} bibleVerseFontColor={bibleVerseFontColor} bibleVerseBgColor={bibleVerseBgColor} bibleVerseBgOpacity={bibleVerseBgOpacity} setlist={setlist} onRemoveFromSetlist={handleRemoveFromSetlist} onSelectPresentation={h.selectPres} bibleHistory={bibleHistory} bibleSavedVerses={bibleSavedVerses} onRemoveSavedVerse={handleRemoveSavedVerse} onJumpToVerse={handleJumpToVerse} />
        )}
      </div>
    </div>
  );
}
