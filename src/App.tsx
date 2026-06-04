import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { Presentation, Slide } from "./types";
import { INITIAL_PRESENTATIONS } from "./data";
import { getPresentations, savePresentations, savePresentationsBulk, loadBiblesFromDB, saveBibleToDB } from "./lib/db";
import { BibleStyleProvider, useBibleStyle } from "./contexts/BibleStyleContext";
import { BookOpen, Music, Sparkles, Monitor, Play, Search } from "lucide-react";
import { getBookInfo } from "./lib/bibleMetadata";

const PresentationList = lazy(() => import("./components/PresentationList"));
const WorkspaceEditor = lazy(() => import("./components/WorkspaceEditor"));
const FullscreenProjection = lazy(() => import("./components/FullscreenProjection"));
const LiveMonitor = lazy(() => import("./components/LiveMonitor"));
const BiblePanel = lazy(() => import("./components/BiblePanel"));
const MobileRemote = lazy(() => import("./components/MobileRemote"));


export function safeSaveLocalStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); }
  catch (e) { console.warn("LocalStorage fail: " + key, e); }
}

export default function App() {
  return (
    <BibleStyleProvider>
      <Suspense fallback={<div className="h-screen w-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <AppContent />
      </Suspense>
    </BibleStyleProvider>
  );
}


function AppContent() {
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

  if (isRemoteMode) return <Suspense fallback={null}><MobileRemote /></Suspense>;
  if (isProjectionMode) return <Suspense fallback={null}><FullscreenProjection /></Suspense>;


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

  const [quickRef, setQuickRef] = useState("");
  const quickRefRegex = /^\s*([1-3]\s*)?([a-zA-Z\u0B80-\u0BFF\s\.\u00a0]+?)\s*(\d+)(?:\s*[:\s-]\s*(\d+))?\s*$/i;
  const handleQuickRefJump = () => {
    const q = quickRef.trim();
    if (!q) return;
    const m = q.match(quickRefRegex);
    if (!m) return;
    const prefix = m[1] || '';
    const bookName = (prefix + m[2]).trim();
    const chapter = parseInt(m[3], 10);
    const verse = m[4] ? parseInt(m[4], 10) : 1;
    const book = getBookInfo(bookName);
    if (!book || chapter < 1 || chapter > book.chaptersCount) return;
    setBibleActiveBookId(book.id);
    setBibleActiveChapter(chapter);
    setBibleActiveVerse(verse);
    setActiveMode("BIBLE");
    setQuickRef("");
  };

  const [activeMode, setActiveMode] = useState<"SONGS" | "BIBLE">("SONGS");
  const [bibleProjectionText, setBibleProjectionText] = useState<string | null>(null);
  const [bibleReferenceText, setBibleReferenceText] = useState("");

  const bs = useBibleStyle();

  const wsRef = useRef<WebSocket | null>(null);
  const [remoteConnectionCount, setRemoteConnectionCount] = useState(0);
  const [isLivePanelOpen, setIsLivePanelOpen] = useState(false);

  const wsStateRef = useRef({ presentations: [] as Presentation[], activePresentation: null as Presentation | null, activePresentationForModes: null as Presentation | null, activePresentationId: null as string | null, activeSlideIndex: null as number | null, bibleProjectionText: null as string | null, bibleReferenceText: "" as string, bibleSlides: [] as Slide[], activeMode: "SONGS" as "SONGS" | "BIBLE" });
  useEffect(() => { wsStateRef.current = { presentations, activePresentation, activePresentationForModes, activePresentationId, activeSlideIndex, bibleProjectionText, bibleReferenceText, bibleSlides, activeMode }; });

  interface HistorySnapshot {
    activeMode: "SONGS" | "BIBLE";
    activeSlideIndex: number | null;
    bibleProjectionText: string | null;
    bibleReferenceText: string;
    isTextCleared: boolean;
    isBlackout: boolean;
    totalSlides: number;
  }
  const historyRef = useRef<HistorySnapshot[]>([]);
  const stateRef = useRef<HistorySnapshot>({ activeMode: "SONGS", activeSlideIndex: null, bibleProjectionText: null, bibleReferenceText: "", isTextCleared: false, isBlackout: false, totalSlides: 0 });
  useEffect(() => { stateRef.current = { activeMode, activeSlideIndex, bibleProjectionText, bibleReferenceText, isTextCleared, isBlackout, totalSlides: activeMode === "BIBLE" ? bibleSlides.length : (activePresentation?.slides.length || 0) }; });

  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(300);
  const countdownStartRef = useRef(0);
  const handleToggleCountdown = () => {
    if (countdownActive) {
      setCountdownActive(false);
    } else {
      countdownStartRef.current = Date.now();
      setCountdownActive(true);
    }
  };

  const importFileRef = useRef<HTMLInputElement>(null);
  const handleExport = async () => {
    const pres = await getPresentations();
    const bibles = await loadBiblesFromDB();
    const lsKeys = ['ultra_minimal_active_id','lyrics_setlist','bible_history','bible_saved_verses','library_sort_by','remote_pin','bible_primary_translation','bible_reference_translation','bible_desc_style','bible_desc_separator','bible_desc_position','bible_desc_show_version','bible_desc_alignment','bible_desc_line_height','bible_layout','bible_pagination_enabled','bible_heading_font_size','bible_heading_font_color','bible_heading_bg_color','bible_heading_bg_opacity','bible_verse_font_size','bible_verse_font_color','bible_verse_bg_color','bible_verse_bg_opacity','remote_paired_state','remote_pairing_pin'];
    const ls: Record<string,string> = {};
    lsKeys.forEach(k => { const v = localStorage.getItem(k); if (v !== null) ls[k] = v; });
    const json = JSON.stringify({ version:1,exportedAt:new Date().toISOString(),presentations:pres,bibles:bibles,localStorage:ls }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type:'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `dalyric-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.version || !data.presentations) throw new Error('Invalid backup');
      if (data.presentations.length) await savePresentationsBulk(data.presentations);
      if (data.bibles?.length) for (const b of data.bibles) await saveBibleToDB(b);
      if (data.localStorage) Object.entries(data.localStorage).forEach(([k,v]) => { try { localStorage.setItem(k, v as string); } catch {} });
      window.location.reload();
    } catch (err) { alert('Import failed: ' + (err instanceof Error ? err.message : 'Unknown error')); }
    e.target.value = '';
  };
  useEffect(() => {
    if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null; }
    if (autoAdvanceDelay <= 0) return;
    autoTimerRef.current = setInterval(() => {
      const snap = stateRef.current;
      if (snap.totalSlides <= 0) return;
      const curIdx = snap.activeSlideIndex ?? -1;
      if (curIdx + 1 >= snap.totalSlides) return;
      historyRef.current.push({ ...snap });
      if (historyRef.current.length > 50) historyRef.current.shift();
      setActiveSlideIndex(curIdx + 1);
      setIsTextCleared(false);
      setIsBlackout(false);
    }, autoAdvanceDelay);
    return () => { if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null; } };
  }, [autoAdvanceDelay]);

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
    activeMode,
    copyright: activeMode === "BIBLE" ? bibleReferenceText : (isDisplayingText && activePresentation?.copyright ? activePresentation.copyright : ""),
    bibleDescPosition: activeMode === "BIBLE" ? bs.bibleDescPosition : "bottom_separate",
    bibleVerseFontSize: bs.bibleVerseFontSize, bibleVerseFontColor: bs.bibleVerseFontColor,
    bibleVerseBgColor: bs.bibleVerseBgColor, bibleVerseBgOpacity: bs.bibleVerseBgOpacity,
    bibleHeadingFontSize: bs.bibleHeadingFontSize, bibleHeadingFontColor: bs.bibleHeadingFontColor,
    bibleHeadingBgColor: bs.bibleHeadingBgColor, bibleHeadingBgOpacity: bs.bibleHeadingBgOpacity,
    liveCaptionText,
    countdownActive,
    countdownDuration,
    countdownStartTime: countdownStartRef.current,
  }), [activeSlide, isBlackout, isTextCleared, isLowerThird, activePresentation, isDisplayingText, activeMode, bibleReferenceText, bs.bibleDescPosition, bs.bibleVerseFontSize, bs.bibleVerseFontColor, bs.bibleVerseBgColor, bs.bibleVerseBgOpacity, bs.bibleHeadingFontSize, bs.bibleHeadingFontColor, bs.bibleHeadingBgColor, bs.bibleHeadingBgOpacity, liveCaptionText, countdownActive, countdownDuration]);

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
        historyRef.current.push({ ...stateRef.current });
        if (historyRef.current.length > 50) historyRef.current.shift();
        setActiveSlideIndex(prev => { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (!d || d.slides.length === 0) return prev; if (prev === null) return 0; return Math.min(prev + 1, d.slides.length - 1); });
        setIsTextCleared(false); setIsBlackout(false);
      } else if (msg.type === "PREV_SLIDE") {
        historyRef.current.push({ ...stateRef.current });
        if (historyRef.current.length > 50) historyRef.current.shift();
        setActiveSlideIndex(prev => { const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation; if (!d || d.slides.length === 0) return prev; if (prev === null || prev === 0) return 0; return prev - 1; });
        setIsTextCleared(false); setIsBlackout(false);
      } else if (msg.type === "TOGGLE_CLEAR") { setIsTextCleared(p => !p); }
      else if (msg.type === "TOGGLE_BLACKOUT") { setIsBlackout(p => !p); }
      else if (msg.type === "FORCE_CLEAR") { setIsTextCleared(msg.value); }
      else if (msg.type === "FORCE_BLACKOUT") { setIsBlackout(msg.value); }
    };
    return () => channel.close();
  }, [activePresentation, activePresentationForModes, activeMode, projectionPacket]);

  // WebSocket with exponential backoff
  useEffect(() => {
    let socket, timeout, retryDelay = 500;
    const connect = () => {
      socket = new WebSocket("ws://127.0.0.1:3002");
      wsRef.current = socket;
      socket.onopen = () => { retryDelay = 500; socket.send(JSON.stringify({ type: "DESKTOP_REGISTER" })); socket.send(JSON.stringify({ type: "UPDATE_PIN", pin: localStorage.getItem("remote_pin") || "1234" })); };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const s = wsStateRef.current;
          if (data.type === "CONNECTION_COUNT") setRemoteConnectionCount(data.count);
          else if (data.type === "SLIDE_NEXT") { historyRef.current.push({ ...stateRef.current }); if (historyRef.current.length > 50) historyRef.current.shift(); const d = s.activeMode === "BIBLE" ? s.activePresentationForModes : s.activePresentation; setActiveSlideIndex(p => { if (!d || d.slides.length === 0) return p; if (p === null) return 0; return Math.min(p + 1, d.slides.length - 1); }); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "SLIDE_PREV") { historyRef.current.push({ ...stateRef.current }); if (historyRef.current.length > 50) historyRef.current.shift(); const d = s.activeMode === "BIBLE" ? s.activePresentationForModes : s.activePresentation; setActiveSlideIndex(p => { if (!d || d.slides.length === 0) return p; if (p === null || p === 0) return 0; return p - 1; }); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "SLIDE_GOTO") h.selectSlide(data.index);
          else if (data.type === "BLACK_SCREEN") setIsBlackout(data.active);
          else if (data.type === "CLEAR_SCREEN") setIsTextCleared(p => !p);
          else if (data.type === "SONG_SELECT") { h.selectPres(data.songId); setActiveMode("SONGS"); }
          else if (data.type === "SONG_SECTION_GOTO") h.selectSlide(data.sectionIndex);
          else if (data.type === "SONG_SEARCH") {
            const q = (data.query || "").toLowerCase();
            socket.send(JSON.stringify({ type: "SONG_LIST", songs: s.presentations.filter(p => p.title.toLowerCase().includes(q)).map(p => ({ id: p.id, title: p.title, artist: p.folder || "Song", ccli: p.copyright || "", sections: p.slides.map((sl, i) => ({ label: sl.label || ("Slide " + (i + 1)), text: sl.text })) })) }));
          }           else if (data.type === "SCRIPTURE_INSERT") { historyRef.current.push({ ...stateRef.current }); if (historyRef.current.length > 50) historyRef.current.shift(); setBibleProjectionText(data.text); setBibleReferenceText(data.bookName + " " + data.chapter + ":" + data.verse); setActiveSlideIndex(0); setActiveMode("BIBLE"); setIsTextCleared(false); setIsBlackout(false); }
          else if (data.type === "LOWER_THIRD_SHOW") setIsLowerThird(true);
          else if (data.type === "LOWER_THIRD_HIDE") setIsLowerThird(false);
        } catch (e) { console.error("[WS Error]", e); }
      };
      socket.onclose = () => { timeout = setTimeout(connect, retryDelay); retryDelay = Math.min(retryDelay * 2, 30000); socket = null; };
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
      const mod = e.ctrlKey || e.metaKey;
      if (mod && k.toLowerCase() === "z") {
        const snap = historyRef.current.pop();
        if (snap) {
          setActiveMode(snap.activeMode);
          setBibleProjectionText(snap.bibleProjectionText);
          setBibleReferenceText(snap.bibleReferenceText);
          setIsTextCleared(snap.isTextCleared);
          setIsBlackout(snap.isBlackout);
          setActiveSlideIndex(snap.activeSlideIndex);
          if (snap.activeMode === "SONGS" && snap.bibleProjectionText === null) setBibleProjectionText(null);
        }
        e.preventDefault(); return;
      }
      if (mod && k.toLowerCase() === "n" && sl.length > 0) {
        const curIdx = sl.findIndex(s => s.presentationId === activePresentationId);
        const nextIdx = curIdx < 0 ? 0 : (curIdx + 1) % sl.length;
        setActivePresentationId(sl[nextIdx].presentationId);
        setActiveSlideIndex(null);
        setActiveMode("SONGS");
        e.preventDefault(); return;
      }
      if (mod && k.toLowerCase() === "p" && sl.length > 0) {
        const curIdx = sl.findIndex(s => s.presentationId === activePresentationId);
        const prevIdx = curIdx <= 0 ? sl.length - 1 : curIdx - 1;
        setActivePresentationId(sl[prevIdx].presentationId);
        setActiveSlideIndex(null);
        setActiveMode("SONGS");
        e.preventDefault(); return;
      }
      if (k.toLowerCase() === "c") { setIsTextCleared(p => !p); e.preventDefault(); }
      else if (k === "Escape") { setIsBlackout(p => !p); e.preventDefault(); }
      else if (k === "ArrowRight" || k === "ArrowDown") {
        const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation;
        if (d && d.slides.length > 0) {
          historyRef.current.push({ ...stateRef.current });
          if (historyRef.current.length > 50) historyRef.current.shift();
          setActiveSlideIndex(p => p === null ? 0 : Math.min(p + 1, d.slides.length - 1));
          setIsTextCleared(false); setIsBlackout(false); e.preventDefault();
        }
      }
      else if (k === "ArrowLeft" || k === "ArrowUp") {
        const d = activeMode === "BIBLE" ? activePresentationForModes : activePresentation;
        if (d && d.slides.length > 0) {
          historyRef.current.push({ ...stateRef.current });
          if (historyRef.current.length > 50) historyRef.current.shift();
          setActiveSlideIndex(p => p === null || p === 0 ? 0 : p - 1);
          setIsTextCleared(false); setIsBlackout(false); e.preventDefault();
        }
      }
    };
    const sl = setlist;
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [activePresentation, activePresentationForModes, activeMode, setlist, activePresentationId]);

  useEffect(() => { if (hasRestored.current) savePresentations(presentations).catch(() => {}); }, [presentations]);
  useEffect(() => { if (activePresentationId) safeSaveLocalStorage("ultra_minimal_active_id", activePresentationId); else try { localStorage.removeItem("ultra_minimal_active_id"); } catch (e) {} }, [activePresentationId]);

  const h = {
    selectPres: (id: string) => { setActivePresentationId(id); setActiveSlideIndex(null); },
    selectSlide: (index: number) => { historyRef.current.push({ ...stateRef.current }); if (historyRef.current.length > 50) historyRef.current.shift(); setActiveSlideIndex(index); setIsTextCleared(false); setIsBlackout(false); },
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
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-950/40 border border-orange-400/20">
            <Music className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 bg-zinc-950 text-orange-400 rounded-full p-0.5 border border-orange-500/40">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
            </div>
          </div>
          <span className="text-lg font-display font-bold tracking-[0.2em] leading-none bg-gradient-to-r from-orange-500 via-amber-300 to-white bg-clip-text text-transparent">DALYRIC</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850/80">
          <button onClick={() => { setActiveMode("SONGS"); setBibleProjectionText(null); }} className={"px-5 py-2 flex items-center gap-1.5 text-[12px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer " + (activeMode === "SONGS" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg shadow-md shadow-orange-950/40 font-extrabold border border-orange-450/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg")}>Songs</button>
          <button onClick={() => setActiveMode("BIBLE")} className={"px-5 py-2 flex items-center gap-1.5 text-[12px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer " + (activeMode === "BIBLE" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg shadow-md shadow-orange-950/40 font-extrabold border border-orange-450/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg")}><BookOpen className="w-4 h-4 text-orange-200" />Bible</button>
        </div>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={quickRef}
            onChange={e => setQuickRef(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleQuickRefJump(); if (e.key === 'Escape') setQuickRef(''); }}
            placeholder="Gen 1:1 or ஆதி 1:1"
            className="w-48 bg-zinc-900/60 hover:bg-zinc-900 focus:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/60 rounded-xl px-3 py-2 pl-10 text-[12px] text-zinc-200 focus:outline-none font-sans placeholder-zinc-500 transition-all"
          />
        </div>
        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2 font-bold">
          <button onClick={() => setIsLivePanelOpen(v => !v)} className={"px-4 py-2 flex items-center gap-1.5 text-[12px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer rounded-xl border " + (isLivePanelOpen ? "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-inner shadow-orange-950/20" : "bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700")}><Monitor className="w-4 h-4" />{isLivePanelOpen ? "Live" : "Preview"}</button>
          <button onClick={() => setAutoAdvanceDelay(p => p === 0 ? 5000 : p === 5000 ? 10000 : p === 10000 ? 30000 : 0)} className={"px-3 py-2 flex items-center gap-1 text-[11px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer rounded-xl border " + (autoAdvanceDelay > 0 ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-zinc-900/80 text-zinc-500 border-zinc-800/80 hover:text-zinc-400 hover:border-zinc-700")}><Play className={"w-3.5 h-3.5 " + (autoAdvanceDelay > 0 ? "fill-green-400" : "")} />{autoAdvanceDelay > 0 ? (autoAdvanceDelay / 1000) + "s" : "Auto"}</button>
          <button onClick={handleToggleCountdown} className={"px-3 py-2 flex items-center gap-1 text-[11px] font-display font-bold tracking-wider uppercase transition-all cursor-pointer rounded-xl border " + (countdownActive ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "bg-zinc-900/80 text-zinc-500 border-zinc-800/80 hover:text-zinc-400 hover:border-zinc-700")}>{countdownActive ? "Stop" : "Timer"}</button>
          <div className="w-px h-6 bg-zinc-800/60 mx-1" />
          <button onClick={handleExport} className="px-3 py-2 bg-zinc-900/80 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700 rounded-xl transition-all text-[11px] font-display font-bold tracking-wider uppercase cursor-pointer" title="Export backup">📦</button>
          <button onClick={() => importFileRef.current?.click()} className="px-3 py-2 bg-zinc-900/80 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700 rounded-xl transition-all text-[11px] font-display font-bold tracking-wider uppercase cursor-pointer" title="Import backup">📂</button>
          <input ref={importFileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <span className="bg-zinc-900/80 text-orange-450 px-4 py-2 rounded-xl border border-zinc-800/80 font-black text-sm text-orange-400">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      </header>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {activeMode === "SONGS" ? (
          <>
            <PresentationList presentations={presentations} activePresentationId={activePresentationId} onSelect={h.selectPres} onAdd={h.addPres} onAddBulk={h.addBulk} onDelete={h.deletePres} onRename={h.renamePres} onAddToSetlist={handleAddToSetlist} onChangeFolder={h.changeFolder} onDeleteMultiple={h.deleteMultiple} />
            <WorkspaceEditor activePresentation={activePresentation} activeSlideIndex={activeSlideIndex} onSelectSlideIndex={h.selectSlide} onUpdatePresentation={h.updatePres} liveCaptionText={liveCaptionText} onUpdateLiveCaptionText={setLiveCaptionText} />
          </>
        ) : (
          <BiblePanel onProjectText={(t, ref, dp) => { historyRef.current.push({ ...stateRef.current }); if (historyRef.current.length > 50) historyRef.current.shift(); setBibleProjectionText(t); setBibleReferenceText(ref); if (dp) bs.setBibleDescPosition(dp); setActiveSlideIndex(0); setIsTextCleared(false); setIsBlackout(false); }} onClearText={() => setIsTextCleared(p => !p)} isTextCleared={isTextCleared} isBlackout={isBlackout} theme="stage" savedVerses={bibleSavedVerses} onToggleSaveVerse={handleToggleSaveVerse} onVerseSelected={handleVerseSelected} activeBookId={bibleActiveBookId} setActiveBookId={setBibleActiveBookId} activeChapter={bibleActiveChapter} setActiveChapter={setBibleActiveChapter} activeVerse={bibleActiveVerse} setActiveVerse={setBibleActiveVerse} />
        )}
        {isLivePanelOpen && (
          <LiveMonitor activePresentation={activePresentationForModes} activeSlideIndex={activeMode === "BIBLE" ? (activeSlide ? activeSlideIndex : null) : activeSlideIndex} isTextCleared={isTextCleared} onToggleClearText={() => setIsTextCleared(!isTextCleared)} isBlackout={isBlackout} onToggleBlackout={() => setIsBlackout(!isBlackout)} bibleDescPosition={bs.bibleDescPosition} isLowerThird={isLowerThird} onToggleLowerThird={() => setIsLowerThird(!isLowerThird)} onProjectToTV={h.projectToTV} activeMode={activeMode} setlist={setlist} onRemoveFromSetlist={handleRemoveFromSetlist} onSelectPresentation={h.selectPres} bibleHistory={bibleHistory} bibleSavedVerses={bibleSavedVerses} onRemoveSavedVerse={handleRemoveSavedVerse} onJumpToVerse={handleJumpToVerse} />
        )}
      </div>
    </div>
  );
}
