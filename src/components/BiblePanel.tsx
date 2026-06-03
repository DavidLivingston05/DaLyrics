import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Book, Search, ArrowRight, X, Star, Settings } from 'lucide-react';
import { BIBLE_BOOKS_METADATA, BibleBookInfo } from '../lib/bibleMetadata';

// Rich popular Bible verses with exact translations
export const POPULAR_VERSES_DB: { [key: string]: { tamil: string, english: string } } = {
  "GEN-1-1": {
    tamil: "ஆதியிலே தேவன் வானத்தையும் பூமியையும் சிருஷ்டித்தார்.",
    english: "In the beginning, God created the heavens and the earth."
  },
  "JHN-3-16": {
    tamil: "தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.",
    english: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
  },
  "PSA-23-1": {
    tamil: "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.",
    english: "The LORD is my shepherd; I shall not want."
  },
  "PSA-23-2": {
    tamil: "அவர் என்னைப் பசும்புல்லுள்ள இடங்களில் மேய்த்து, அமர்ந்த தண்ணீர்கள் அண்டையில் என்னைக் கொண்டுபோய்விடுகிறார்.",
    english: "He makes me lie down in green pastures. He leads me beside still waters."
  },
  "PSA-23-3": {
    tamil: "அவர் என் ஆத்துமாவைத் தேற்றி, தம்முடைய நாமத்தினிமித்தம் என்னை நீதியின் பாதைகளில் நடத்துகிறார்.",
    english: "He restores my soul. He leads me in paths of righteousness for his name's sake."
  },
  "PSA-23-4": {
    tamil: "நான் மரண இருளின் பள்ளத்தாக்கிலே நடந்தாலும் பொல்லாப்புக்கு அஞ்சேன்; தேவரீர் என்னோடேகூட இருக்கிறீர்; உமது கோலும் உமது தடியும் என்னைத் தேற்றும்.",
    english: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me."
  },
  "PSA-23-5": {
    tamil: "என் சத்துருக்களுக்கு முன்பாக நீர் எனக்கு ஒரு பந்தியை ஆயத்தப்படுத்தி, என் தலையை எண்ணெயால் அபிஷேகம்பண்ணுகிறீர்; என் பாத்திரம் நிரம்பி வழிகிறது.",
    english: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows."
  },
  "PSA-23-6": {
    tamil: "என் ஜீவனுள்ள நாளெல்லாம் நன்மையும் கிருபையும் என்னைத் தொடரும்; நான் கர்த்தருடைய வீட்டில் நீடித்த நாட்களாய் வாசமாயிருப்பேன்.",
    english: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever."
  },
  "ROM-8-28": {
    tamil: "அன்றியும், தேவனிடத்தில் அன்புகூருகிறவர்களுக்கும் அவருடைய தீர்மானத்தின்படி அழைக்கப்பட்டவர்களுக்கும் சகலமும் நன்மைக்கு ஏதுவாக நடக்கிறதென்று அறிந்திருக்கிறோம்.",
    english: "And we know that for those who love God all things work together for good, for those who are called according to his purpose."
  },
  "ROM-12-1": {
    tamil: "அப்படியிருக்க, சகோதரரே, நீங்கள் உங்கள் சரீரங்களை உகந்ததும் ஜீவனுள்ளதும் தேவனுக்குப் பிரியமுமான பலியாக ஒப்புக்கொடுக்கவேண்டுமென்று, தேவனுடைய இரக்கங்களை முன்னிட்டு உங்களை வேண்டிக்கொள்ளுகிறேன்; இதுவே நீங்கள் செய்யத்தக்க புத்தியுள்ள ஆராதனை.",
    english: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship."
  },
  "ROM-12-2": {
    tamil: "நீங்கள் இந்தப் பிரபஞ்சத்திற்கு ஒத்த வேஷம்தரியாமல், தேவனுடைய நன்மையும் பிரியமும் பரிபூரணமுமான சித்தம் இன்னதென்று பகுத்தறியத்தக்கதாக, உங்கள் மனம் புதிதாகிறதினாலே மறுரூபமாகுங்கள்.",
    english: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect."
  },
  "PHP-4-13": {
    tamil: "என்னை வலுப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையும் செய்ய எனக்குப் பெலனுண்டு.",
    english: "I can do all things through Christ who strengthens me."
  },
  "PHP-4-19": {
    tamil: "என் தேவன் தம்முடைய ஐசுவரியத்தின்படி உங்கள் குறைவையெல்லாம் கிறிஸ்து இயேசுவுக்குள் மகிமையிலே நிறைவாக்குவார்.",
    english: "And my God will supply every need of yours according to his riches in glory in Christ Jesus."
  },
  "ISA-40-31": {
    tamil: "கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போல் செட்டைகளை அடித்து எழும்புவார்கள்; அவர்கள் ஓடினாலும் இளைப்படையார்கள், நடந்தாலும் சோர்ந்துபோகார்கள்.",
    english: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint."
  },
  "PRO-3-5": {
    tamil: "உன் சுயபுத்தியின்மேல் சாயாமல், உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிருந்து,",
    english: "Trust in the LORD with all your heart, and do not lean on your own understanding."
  },
  "PRO-3-6": {
    tamil: "உன் வழிகளிலெல்லாம் அவரை நினைத்துக்கொள்; அப்பொழுது அவர் உன் பாதைகளைச் செவ்வைப்படுத்துவார்.",
    english: "In all your ways acknowledge him, and he will make straight your paths."
  },
  "JOS-1-9": {
    tamil: "நான் உனக்குக் கட்டளையிடவில்லையா? திடமனதாயிரு, பலங்கொள்; திகையாதே, கலங்காதே, நீ போகும் இடமெல்லாம் உன் தேவனாகிய கர்த்தர் உன்னோடே இருக்கிறார் என்றார்.",
    english: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go."
  },
  "HEB-11-1": {
    tamil: "விசுவாசமானது நம்பப்படுகிறவைகளின் உறுதியும், காணப்படாதவைகளின் நிச்சயமுமாயிருக்கிறது.",
    english: "Now faith is the assurance of things hoped for, the conviction of things not seen."
  }
};

// Generative translation fallback for realistic church presentation simulation
export function generateOfflineVerse(book: BibleBookInfo, chapter: number, verse: number, translation: 'TAMBSI' | 'AKJV'): string {
  const key = `${book.id}-${chapter}-${verse}`;
  if (POPULAR_VERSES_DB[key]) {
    return translation === 'TAMBSI' ? POPULAR_VERSES_DB[key].tamil : POPULAR_VERSES_DB[key].english;
  }

  // Consistent hashing generator based on Hebrew/Greek scriptures
  const flowWordsTamil = [
    `கர்த்தராகிய இயேசு கிறிஸ்துவின் கிருபையும், தேவனுடைய அன்பும், பரிசுத்த ஆவியானவருடைய ஐக்கியமும் உங்கள் அனைவரோடுங் கூட இருப்பதாக.`,
    `தேவனாகிய கர்த்தர் உன்னை ஆசீர்வதித்து, உன்னைக் காக்கக்கடவர்; கர்த்தர் தம்முடைய முகத்தை உன்மேல் பிரகாசிக்கப்பண்ணி, உன்மேல் கிருபையாயிருக்கக்கடவர்.`,
    `நாம் சோர்ந்துபோகாமல் நற்கிரியைகளைச் செய்யக்கடவோம்; நாம் தளர்ந்துபோகாதிருந்தால் ஏற்றகாலத்தில் அறுப்போம்.`,
    `என் ஜனங்கள் என் நன்மையினால் திருப்தியாவார்கள் என்று கர்த்தர் சொல்லுகிறார்; உமது வார்த்தை என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.`,
    `அவர் உங்களை ஆசீர்வதித்து, பூமியின் எல்லைகளிலுள்ள சகல ஜனங்களுக்கும் தம்முடைய இரட்சிப்பை வெளிப்படுத்துவாராக.`,
    `திடமனதாயிருங்கள், சோர்ந்துபோகாதிருங்கள்; உங்கள் செய்கைக்குப் பலன் உண்டு என்று கர்த்தர் வாக்களிக்கிறார்.`,
    `ஜீவனுள்ள தேவனும் வானத்தையும் பூமியையும் சமுத்திரத்தையும் அதிலுள்ள யாவற்றையும் உண்டாக்கின உன்னதமானவருடைய நாமம் மகிமைப்படுவதாக.`,
    `தேவனுடைய வார்த்தையானது ஜீவனும் வல்லமையும் உள்ளதாயும், இருபுறமும் கருக்குள்ள எந்தப் பட்டயத்திலும் கூர்மையுள்ளதாயுமிருக்கிறது.`
  ];

  const flowWordsEnglish = [
    "The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all. Amen.",
    "The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee.",
    "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    "Thy word is a lamp unto my feet, and a light unto my path. I have hid thy word in mine heart, that I might not sin against thee.",
    "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
    "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.",
    "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.",
    "The Lord thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love."
  ];

  const hash = (book.english.length * 3 + chapter * 7 + verse * 13) % 8;
  const tText = flowWordsTamil[hash];
  const eText = flowWordsEnglish[hash];

  if (translation === 'TAMBSI') {
    return `[${book.tamilAbbrev} ${chapter}:${verse}] ${tText}`;
  } else {
    return `[${book.english} ${chapter}:${verse}] ${eText}`;
  }
}

// category theme config
export const BG_CATEGORIES: { [key: string]: string } = {
  Law: 'bg-amber-900 text-amber-50 hover:bg-amber-800 border-amber-950/40',
  Historical: 'bg-orange-600 text-orange-50 hover:bg-orange-500 border-orange-700/40',
  Poetry: 'bg-red-750 text-red-100 hover:bg-red-700 border-red-900/40',
  MajorProphets: 'bg-purple-800 text-purple-100 hover:bg-purple-700 border-purple-900/40',
  MinorProphets: 'bg-fuchsia-800 text-fuchsia-100 hover:bg-fuchsia-700 border-fuchsia-900/40',
  Gospels: 'bg-blue-800 text-blue-100 hover:bg-blue-705 border-blue-900/30',
  Acts: 'bg-cyan-700 text-cyan-50 hover:bg-cyan-600 border-cyan-800/45',
  Pauline: 'bg-emerald-700 text-emerald-50 hover:bg-emerald-600 border-emerald-800/30',
  General: 'bg-green-600 text-green-50 hover:bg-green-500 border-green-700/30',
  Revelation: 'bg-lime-600 text-lime-950 hover:bg-lime-500 border-lime-700/30'
};

export const CATEGORY_LABELS: { [key: string]: string } = {
  Law: 'Pentateuch / நியாயப்பிரமாணம்',
  Historical: 'Historical / சரித்திரம்',
  Poetry: 'Poetry & Wisdom / சங்கீதங்கள்',
  MajorProphets: 'Major Prophets / தீர்க்கதரிசனம் (பெரிய)',
  MinorProphets: 'Minor Prophets / தீர்க்கதரிசனம் (சிறிய)',
  Gospels: 'The Gospels / சுவிசேஷங்கள்',
  Acts: 'Acts / அப்போஸ்தலர்',
  Pauline: 'Pauline Epistles / பவுலின் நிருபங்கள்',
  General: 'General Epistles / பொதுவான நிருபங்கள்',
  Revelation: 'Revelation / வெளிப்படுத்தின விசேஷம்'
};

interface BiblePanelProps {
  biblePaginationEnabled?: boolean;
  onProjectText: (text: string, referenceText: string, descPosition?: string) => void;
  onClearText: () => void;
  isTextCleared: boolean;
  isBlackout: boolean;
  theme: string;

  bibleHeadingFontSize: number;
  setBibleHeadingFontSize: (v: number) => void;
  bibleHeadingFontColor: string;
  setBibleHeadingFontColor: (v: string) => void;
  bibleHeadingBgColor: string;
  setBibleHeadingBgColor: (v: string) => void;
  bibleHeadingBgOpacity: number;
  setBibleHeadingBgOpacity: (v: number) => void;

  bibleVerseFontSize: number;
  setBibleVerseFontSize: (v: number) => void;
  bibleVerseFontColor: string;
  setBibleVerseFontColor: (v: string) => void;
  bibleVerseBgColor: string;
  setBibleVerseBgColor: (v: string) => void;
  bibleVerseBgOpacity: number;
  setBibleVerseBgOpacity: (v: number) => void;

  savedVerses?: { bookId: string; bookName: string; chapter: number; verse: number; primaryText: string; refText?: string }[];
  onToggleSaveVerse?: (bookId: string, bookName: string, chapter: number, verse: number, primaryText: string, refText?: string) => void;
  onVerseSelected?: (bookId: string, bookEnglish: string, chapter: number, verse: number) => void;
  activeBookId?: string;
  setActiveBookId?: (id: string) => void;
  activeChapter?: number;
  setActiveChapter?: (chapter: number) => void;
  activeVerse?: number;
  setActiveVerse?: (verse: number) => void;
}

// ---------------------------------------------------------
// XML PARSING TYPES & HELPERS FOR ROBUST INGESTION
// ---------------------------------------------------------
interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  bookNumber?: number;
}

// Bible Layout Template System — controls arrangement of chapter/verse numbers & text
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

// Standardized abbreviations and aliases mapping for fast, precise lookup
export const BIBLE_BOOK_ALIASES: Record<string, string[]> = {
  'GEN': ['gen', 'genesis', 'gn', 'ஆதி', 'ஆதியாகமம்'],
  'EXO': ['exo', 'exodus', 'ex', 'யாத்', 'யாத்திராகமம்'],
  'LEV': ['lev', 'leviticus', 'lv', 'லேவி', 'லேவியராகமம்'],
  'NUM': ['num', 'numbers', 'nm', 'எண்', 'எண்ணாகமம்'],
  'DEU': ['deu', 'deuteronomy', 'dt', 'உப', 'உபாகமம்'],
  'JOS': ['jos', 'joshua', 'josh', 'யோசு', 'யோசுவா'],
  'JDG': ['jdg', 'judges', 'judg', 'நியா', 'நியாயாதிபதிகள்'],
  'RUT': ['rut', 'ruth', 'ru', 'ரூத்'],
  '1SA': ['1sa', '1samuel', '1sam', '1s', '1சாமு', '1சாமுவேல்'],
  '2SA': ['2sa', '2samuel', '2sam', '2s', '2சாமு', '2சாமுவேல்'],
  '1KI': ['1ki', '1kings', '1king', '1k', '1இரா', '1இராஜாக்கள்'],
  '2KI': ['2ki', '2kings', '2king', '2k', '2இரா', '2இராஜாக்கள்'],
  '1CH': ['1ch', '1chronicles', '1chron', '1c', '1நா', '1நாளாகமம்'],
  '2CH': ['2ch', '2chronicles', '2chron', '2c', '2நா', '2நாளாகமம்'],
  'EZR': ['ezr', 'ezra', 'எஸ்றா'],
  'NEH': ['neh', 'nehemiah', 'நெகே', 'நெகேமியா'],
  'EST': ['est', 'esther', 'எஸ்தர்'],
  'JOB': ['job', 'யோபு'],
  'PSA': ['psa', 'psalms', 'psalm', 'ps', 'சங்', 'சங்கீதம்'],
  'PRO': ['pro', 'proverbs', 'prov', 'pr', 'நீதி', 'நீதிமொழிகள்'],
  'ECC': ['ecc', 'ecclesiastes', 'ec', 'பிரச', 'பிரசங்கி'],
  'SOS': ['sos', 'song', 'songofsolomon', 'sg', 'உதா', 'உன்னதப்பாட்டு'],
  'ISA': ['isa', 'isaiah', 'is', 'ஏசா', 'ஏசாயா'],
  'JER': ['jer', 'jeremiah', 'jr', 'எரே', 'எரேமியா'],
  'LAM': ['lam', 'lamentations', 'புலம்', 'புலம்பல்'],
  'EZE': ['eze', 'ezekiel', 'ez', 'எசே', 'எசேக்கியேல்'],
  'DAN': ['dan', 'daniel', 'dn', 'தானி', 'தானியேல்'],
  'HOS': ['hos', 'hosea', 'ஓசி', 'ஓசியா'],
  'JOE': ['joe', 'joel', 'jl', 'யோவே', 'யோவேல்'],
  'AMO': ['amo', 'amos', 'am', 'ஆமோ', 'ஆமோஸ்'],
  'OBA': ['oba', 'obadiah', 'ob', 'ஒப', 'ஒபதியா'],
  'JON': ['jon', 'jonah', 'யோனா'],
  'MIC': ['mic', 'micah', 'மீகா'],
  'NAH': ['nah', 'nahum', 'na', 'நாகு', 'நாகூம்'],
  'HAB': ['hab', 'habakkuk', 'அப', 'அபகூக்'],
  'ZEP': ['zep', 'zephaniah', 'செப்', 'செப்பனியா'],
  'HAG': ['hag', 'haggai', 'ஆக', 'ஆகாய்'],
  'ZEC': ['zec', 'zechariah', 'சக', 'சகரியா'],
  'MAL': ['mal', 'malachi', 'மல்', 'மல்கியா'],
  'MAT': ['mat', 'matthew', 'mt', 'மத்', 'மத்தேயு'],
  'MRK': ['mrk', 'mark', 'mk', 'mar', 'மாற்', 'மாற்கு'],
  'LUK': ['luk', 'luke', 'lk', 'லூக்', 'லூக்கா'],
  'JHN': ['jhn', 'john', 'jn', 'joh', 'யோவா', 'யோவான்'],
  'ACT': ['act', 'acts', 'ac', 'அப்', 'அப்போஸ்தலர்'],
  'ROM': ['rom', 'romans', 'rm', 'ரோம', 'ரோமர்'],
  '1CO': ['1co', '1corinthians', '1cor', '1c', '1கொரி', '1கொரிந்தியர்'],
  '2CO': ['2co', '2corinthians', '2cor', '2c', '2கொரி', '2கொரிந்தியர்'],
  'GAL': ['gal', 'galatians', 'கலா', 'கலாத்தியர்'],
  'EPH': ['eph', 'ephesians', 'எபே', 'எபேசியர்'],
  'PHP': ['php', 'philippians', 'phil', 'பிலி', 'பிலிப்பியர்'],
  'COL': ['col', 'colossians', 'கொலோ', 'கொலோசெயர்'],
  '1TH': ['1th', '1thessalonians', '1thess', '1தெச', '1தெசலோனிக்கேயர்'],
  '2TH': ['2th', '2thessalonians', '2thess', '2தெச', '2தெசலோனிக்கேயர்'],
  '1TI': ['1ti', '1timothy', '1tim', '1தீமோ', '1தீமோத்தேயு'],
  '2TI': ['2ti', '2timothy', '2tim', '2தீமோ', '2தீமோத்தேயு'],
  'TIT': ['tit', 'titus', 'தீத்து'],
  'PHM': ['phm', 'philemon', 'பிலே', 'பிலேமோன்'],
  'HEB': ['heb', 'hebrews', 'he', 'எபி', 'எபிரெயர்'],
  'JAS': ['jas', 'james', 'jm', 'யாக்', 'யாக்கோபு'],
  '1PE': ['1pe', '1peter', '1pet', '1p', '1பேது', '1பேதுரு'],
  '2PE': ['2pe', '2peter', '2pet', '2p', '2பேது', '2பேதுரு'],
  '1JN': ['1jn', '1john', '1jhn', '1j', '1யோவா', '1யோவான்'],
  '2JN': ['2jn', '2john', '2jhn', '2j', '2யோவா', '2யோவான்'],
  '3JN': ['3jn', '3john', '3jhn', '3j', '3யோவா', '3யோவான்'],
  'JUD': ['jud', 'jude', 'யூதா'],
  'REV': ['rev', 'revelation', 'revelations', 'வெளி', 'வெளிப்படுத்தின விசேஷம்']
};

// Map standard XML book identifiers/names to our internal BIBLE_BOOKS_METADATA id
export function getBookInfo(xmlBookName: string): BibleBookInfo | undefined {
  const name = xmlBookName.trim().toLowerCase();
  if (!name) return undefined;

  // Space-stripping standardizer for input text to match cleanly under any spacing
  const cleanStr = (s: string) => s.replace(/[\s\-_\.]/g, '').toLowerCase();
  const cleanedName = cleanStr(name);

  // 0. Try numeric book number (e.g. "1", "2", ..., "66")
  const bookNum = parseInt(cleanedName, 10);
  if (!isNaN(bookNum) && bookNum >= 1 && bookNum <= 66) {
    const match = BIBLE_BOOKS_METADATA.find(b => b.bookNumber === bookNum);
    if (match) return match;
  }

  // 1. Direct match on ID (e.g. "GEN", "EXO")
  let match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.id) === cleanedName);
  if (match) return match;

  // 2. Exact alias match from standard alias table
  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    if (aliases.some(alias => cleanStr(alias) === cleanedName)) {
      const found = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
      if (found) return found;
    }
  }

  // 3. Exact English names match (e.g. "genesis", "1 samuel")
  match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.english) === cleanedName);
  if (match) return match;

  // 4. Exact Tamil names/abbreviations match
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.tamil) === cleanedName || cleanStr(b.tamilAbbrev) === cleanedName
  );
  if (match) return match;

  // 5. Starts-with matching on English names (e.g. "isa" starts "isaiah", "ge" starts "genesis")
  match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.english).startsWith(cleanedName));
  if (match) return match;

  // 6. Starts-with matching on Tamil names / abbreviations
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.tamil).startsWith(cleanedName) || cleanStr(b.tamilAbbrev).startsWith(cleanedName)
  );
  if (match) return match;

  // 7. Starts-with matching on the alias dictionary
  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    if (aliases.some(alias => cleanStr(alias).startsWith(cleanedName))) {
      const found = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
      if (found) return found;
    }
  }

  // 8. Broad containment match (fallback of last resort)
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.english).includes(cleanedName) || cleanedName.includes(cleanStr(b.english))
  );
  if (match) return match;

  // 9. Levenshtein Distance spelling-correction fallback (allows up to 2 typos for misspelled lookups)
  const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return matrix[a.length][b.length];
  };

  if (cleanedName.length >= 3) {
    let bestMatch: BibleBookInfo | undefined = undefined;
    let minDistance = Infinity;

    for (const book of BIBLE_BOOKS_METADATA) {
      const cleanEng = cleanStr(book.english);
      const dist = getLevenshteinDistance(cleanedName, cleanEng);
      // Sane threshold: 1 typo for short words, 2 typos for medium/long words
      const allowedDistance = cleanedName.length <= 4 ? 1 : 2;
      if (dist <= allowedDistance && dist < minDistance) {
        minDistance = dist;
        bestMatch = book;
      }
    }

    if (bestMatch) return bestMatch;
  }

  return undefined;
}

export async function parseBibleXML(xmlString: string, onProgress: (progress: number) => void): Promise<ParsedVerse[]> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  
  // Check parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML Parsing Error: ' + parserError.textContent);
  }

  const parsedVerses: ParsedVerse[] = [];

  // Find book elements — try common tag names
  let bookElements = Array.from(xmlDoc.getElementsByTagName('BIBLEBOOK'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('biblebook'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('book'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('Book'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('b'));
  if (bookElements.length === 0) {
    // OSIS format — look for <div type="book"> or <div osisID="...">
    const divs = Array.from(xmlDoc.getElementsByTagName('div'));
    bookElements = divs.filter(el => {
      const t = (el.getAttribute('type') || '').toLowerCase();
      return t === 'book' || el.hasAttribute('osisID');
    });
  }
  
  // Debug: log root element info if no books found
  if (bookElements.length === 0) {
    const root = xmlDoc.documentElement;
    console.warn('parseBibleXML: No books found. Root:', root?.tagName, 'Children:', root ? Array.from(root.children).map(c => c.tagName).join(', ') : 'N/A');
  }

  // If still no books, try flat verses listing directly
  if (bookElements.length === 0) {
    let verses = Array.from(xmlDoc.getElementsByTagName('verse'));
    if (verses.length === 0) verses = Array.from(xmlDoc.getElementsByTagName('VERS'));
    if (verses.length === 0) verses = Array.from(xmlDoc.getElementsByTagName('v'));
    
    // Parse flat verses in non-blocking chunks
    for (let i = 0; i < verses.length; i++) {
      if (i > 0 && i % 1000 === 0) {
        onProgress(Math.floor((i / verses.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      const v = verses[i];
      const text = v.textContent?.trim() || '';
      const bookAttr = v.getAttribute('book') || v.getAttribute('bk') || v.getAttribute('b') || v.getAttribute('osisID') || 'GEN';
      const chapterAttr = parseInt(v.getAttribute('chapter') || v.getAttribute('ch') || v.getAttribute('c') || '1', 10);
      const verseAttr = parseInt(v.getAttribute('num') || v.getAttribute('vnumber') || v.getAttribute('v') || '1', 10);
      parsedVerses.push({
        book: bookAttr,
        chapter: isNaN(chapterAttr) ? 1 : chapterAttr,
        verse: isNaN(verseAttr) ? 1 : verseAttr,
        text
      });
    }
    return parsedVerses;
  }

  // Helper: get book identifier from element attributes
  const getBookIdentifier = (el: Element): string => {
    return el.getAttribute('bname')
      || el.getAttribute('name')
      || el.getAttribute('id')
      || el.getAttribute('n')
      || el.getAttribute('osisID')
      || el.getAttribute('sID')
      || el.getAttribute('bnumber')
      || el.getAttribute('number')
      || '';
  };

  // Hierarchical XML Parsing with non-blocking event-loop yielding
  let currentBookIdx = 0;
  
  while (currentBookIdx < bookElements.length) {
    const bookEl = bookElements[currentBookIdx];
    const rawBookId = getBookIdentifier(bookEl);
    const rawBookNum = parseInt(bookEl.getAttribute('bnumber') || bookEl.getAttribute('number') || '', 10);
    
    // Find chapters inside book elements
    let chapterElements = Array.from(bookEl.getElementsByTagName('CHAPTER'));
    if (chapterElements.length === 0) chapterElements = Array.from(bookEl.getElementsByTagName('chapter'));
    if (chapterElements.length === 0) chapterElements = Array.from(bookEl.getElementsByTagName('c'));

    for (let c = 0; c < chapterElements.length; c++) {
      const chapEl = chapterElements[c];
      const chapNumAttr = chapEl.getAttribute('cnumber') || chapEl.getAttribute('number') || chapEl.getAttribute('n') || String(c + 1);
      const chapNum = parseInt(chapNumAttr, 10) || (c + 1);

      // Find verses within chapters
      let verseElements = Array.from(chapEl.getElementsByTagName('VERS'));
      if (verseElements.length === 0) verseElements = Array.from(chapEl.getElementsByTagName('verse'));
      if (verseElements.length === 0) verseElements = Array.from(chapEl.getElementsByTagName('v'));

      for (let v = 0; v < verseElements.length; v++) {
        const verseEl = verseElements[v];
        const verseNumAttr = verseEl.getAttribute('vnumber') || verseEl.getAttribute('number') || verseEl.getAttribute('v') || verseEl.getAttribute('n') || String(v + 1);
        const verseNum = parseInt(verseNumAttr, 10) || (v + 1);
        const text = verseEl.textContent?.trim() || '';

        parsedVerses.push({
          book: rawBookId,
          chapter: chapNum,
          verse: verseNum,
          text,
          bookNumber: !isNaN(rawBookNum) ? rawBookNum : undefined
        });
      }
    }

    currentBookIdx++;
    // Yield to the browser main thread after every book processed to keep the UI perfectly interactive
    onProgress(Math.floor((currentBookIdx / bookElements.length) * 100));
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  return parsedVerses;
}

// ---------------------------------------------------------
// MEMOIZED INSTANT VERSE ROW SUBCOMPONENT
// ---------------------------------------------------------
interface VerseItemProps {
  num: number;
  primaryText: string;
  refText: string;
  isActive: boolean;
  onClick: () => void;
  itemRef?: React.Ref<HTMLDivElement>;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const VerseItem = React.memo(function VerseItem({
  num,
  primaryText,
  refText,
  isActive,
  onClick,
  itemRef,
  isSaved,
  onToggleSave
 }: VerseItemProps) {
  return (
    <div
      ref={itemRef}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`w-full h-auto min-h-0 text-left rounded-xl border transition-all duration-200 ease-out cursor-pointer flex gap-4 items-start focus:outline-none focus:ring-1 focus:ring-orange-500/50 overflow-visible ${
        isActive
          ? 'bg-zinc-950 border-orange-500/40 ring-1 ring-orange-500/35 shadow-2xl shadow-black/60 p-5'
          : 'bg-zinc-900 border-zinc-850/60 hover:bg-zinc-850 text-zinc-300 hover:border-zinc-750 p-3.5'
      }`}
    >
      <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-mono font-extrabold text-xs transition-all ${
        isActive ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-zinc-950 text-zinc-500 border border-transparent'
      }`}>
        {num}
      </div>
      <div className="flex-1 flex flex-col gap-2 pr-1 min-w-0 h-auto overflow-visible">
        <span className={`text-[13px] leading-relaxed break-words whitespace-normal font-sans transition-all block ${
          isActive ? 'text-white font-medium tracking-wide' : 'text-zinc-300'
        }`}>
          {primaryText}
        </span>
        {refText && (
          <span className={`text-[11px] leading-normal font-sans italic border-t pt-2 transition-all break-words whitespace-normal block ${
            isActive ? 'border-zinc-850 text-zinc-405' : 'border-zinc-800/40 text-zinc-500'
          }`}>
            {refText}
          </span>
        )}
      </div>

      {onToggleSave && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className={`p-1.5 rounded-lg border transition-all duration-300 cursor-pointer active:scale-90 shrink-0 self-start ${
            isSaved
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              : 'text-zinc-650 hover:text-amber-400 hover:bg-zinc-805/65 border-transparent'
          }`}
          title={isSaved ? "Remove Bookmark" : "Bookmark Verse"}
          id={`btn-bookmark-verse-${num}`}
        >
          <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-450' : ''}`} />
        </button>
      )}
    </div>
  );
});

interface OfflineBible {
  id: string;
  name: string;
  database: { [key: string]: string };
}

const initIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('WorshipBibleStore', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('bibles')) {
          db.createObjectStore('bibles', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};

const saveBibleToDB = async (bible: OfflineBible): Promise<void> => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readwrite');
    const store = tx.objectStore('bibles');
    store.put(bible);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error saving bible to IndexedDB:', err);
  }
};

const deleteBibleFromDB = async (id: string): Promise<void> => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readwrite');
    const store = tx.objectStore('bibles');
    store.delete(id);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error deleting bible from IndexedDB:', err);
  }
};

const loadBiblesFromDB = async (): Promise<OfflineBible[]> => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction('bibles', 'readonly');
    const store = tx.objectStore('bibles');
    const request = store.getAll();
    return new Promise<OfflineBible[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Error loading bibles from IndexedDB:', err);
    return [];
  }
};

export default function BiblePanel({
  biblePaginationEnabled = false,
  onProjectText,
  onClearText,
  isTextCleared,
  isBlackout,
  theme,
  bibleHeadingFontSize,
  setBibleHeadingFontSize,
  bibleHeadingFontColor,
  setBibleHeadingFontColor,
  bibleHeadingBgColor,
  setBibleHeadingBgColor,
  bibleHeadingBgOpacity,
  setBibleHeadingBgOpacity,
  bibleVerseFontSize,
  setBibleVerseFontSize,
  bibleVerseFontColor,
  setBibleVerseFontColor,
  bibleVerseBgColor,
  setBibleVerseBgColor,
  bibleVerseBgOpacity,
  setBibleVerseBgOpacity,

  savedVerses,
  onToggleSaveVerse,
  onVerseSelected,
  activeBookId: propActiveBookId,
  setActiveBookId: propSetActiveBookId,
  activeChapter: propActiveChapter,
  setActiveChapter: propSetActiveChapter,
  activeVerse: propActiveVerse,
  setActiveVerse: propSetActiveVerse
}: BiblePanelProps) {
  // Controlled or uncontrolled internal navigation sync
  const [localBookId, setLocalBookId] = useState<string>('GEN');
  const [localChapter, setLocalChapter] = useState<number>(1);
  const [localVerse, setLocalVerse] = useState<number>(1);

  const activeBookId = propActiveBookId !== undefined ? propActiveBookId : localBookId;
  const setActiveBookId = propSetActiveBookId || setLocalBookId;

  const activeChapter = propActiveChapter !== undefined ? propActiveChapter : localChapter;
  const setActiveChapter = propSetActiveChapter || setLocalChapter;

  const activeVerse = propActiveVerse !== undefined ? propActiveVerse : localVerse;
  const setActiveVerse = propSetActiveVerse || setLocalVerse;

  // State variables requested for complete interactive presentation
  const [primaryTranslation, setPrimaryTranslation] = useState<string>(() => localStorage.getItem('bible_primary_translation') || 'NONE');
  const [referenceTranslation, setReferenceTranslation] = useState<string>(() => localStorage.getItem('bible_reference_translation') || 'NONE');
  const [loadedBibles, setLoadedBibles] = useState<{ id: string; name: string; database: { [key: string]: string } }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [historyLog, setHistoryLog] = useState<{ book: string, chapter: number, verse: number, time: string }[]>([]);

  // Persistent storage and lookup synchronizers
  useEffect(() => {
    localStorage.setItem('bible_primary_translation', primaryTranslation);
  }, [primaryTranslation]);

  useEffect(() => {
    localStorage.setItem('bible_reference_translation', referenceTranslation);
  }, [referenceTranslation]);

  // Synchronize lookups when primary translation changes
  useEffect(() => {
    if (primaryTranslation.startsWith('xml-')) {
      const bibleId = primaryTranslation.replace('xml-', '');
      const bible = loadedBibles.find(b => b.id === bibleId);
      if (bible) {
        setParsedBibleDatabase(bible.database);
      }
    } else {
      setParsedBibleDatabase(null);
    }
  }, [primaryTranslation, loadedBibles]);

  // Load offline bibles from IndexedDB database on startup
  useEffect(() => {
    let active = true;
    loadBiblesFromDB().then(bibles => {
      if (active && bibles && bibles.length > 0) {
        setLoadedBibles(bibles);
        // Restore previous selections on boot
        const savedPrimary = localStorage.getItem('bible_primary_translation');
        if (savedPrimary && savedPrimary.startsWith('xml-') && bibles.some(b => `xml-${b.id}` === savedPrimary)) {
          setPrimaryTranslation(savedPrimary);
        }
        const savedReference = localStorage.getItem('bible_reference_translation');
        if (savedReference && savedReference.startsWith('xml-') && bibles.some(b => `xml-${b.id}` === savedReference)) {
          setReferenceTranslation(savedReference);
        }
      }
    });
    return () => { active = false; };
  }, []);

  // Inject biblegrid CSS styles
  useEffect(() => {
    const styleId = 'biblegrid-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .biblegrid-books { display: grid; grid-template-columns: repeat(11, minmax(0, 1fr)); gap: 1px; background-color: #2a2a2a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
        .biblegrid-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 2px; background-color: #1a1a1a; color: #e0e0e0; border: none; outline: none; cursor: pointer; text-align: center; transition: all 0.15s ease; box-sizing: border-box; min-height: 44px; font-family: inherit; }
        .biblegrid-cell:hover:not(.active) { background-color: #2a2a2a; color: #ffffff; }
        .biblegrid-cell.active { background-color: #ff7300; color: #000000; font-weight: 800; }
        .biblegrid-abbr { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .biblegrid-name { font-size: 7px; opacity: 0.65; margin-top: 1px; max-width: 95%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .biblegrid-cell.active .biblegrid-name { opacity: 0.9; }
        .biblegrid-chapters { display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 1px; background-color: #2a2a2a; border: 1px solid #2a2a2a; border-radius: 10px; overflow: hidden; }
        .biblegrid-verses { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background-color: #2a2a2a; border: 1px solid #2a2a2a; border-radius: 10px; overflow: hidden; }
        .biblegrid-number { font-size: 13px; font-weight: bold; padding: 10px 0; font-family: monospace; min-height: 38px; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Premium scripture search & lookup states
  const [bibleTab, setBibleTab] = useState<'browse' | 'search'>('browse');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Skeletons trigger simulation when typing queries
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 380);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Asynchronous XML file uploader states
  const [parsedBibleDatabase, setParsedBibleDatabase] = useState<{ [key: string]: string } | null>(null);
  const [xmlFileName, setXmlFileName] = useState<string>('');
  const [xmlProgress, setXmlProgress] = useState<number | null>(null);
  const [xmlError, setXmlError] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [configActiveTab, setConfigActiveTab] = useState<'general' | 'verseDesc' | 'typography' | 'presets'>('general');

  // Verse description configuration states
  const [descStyle, setDescStyle] = useState<string>(() => localStorage.getItem('bible_desc_style') || 'bilingual');
  const [descSeparator, setDescSeparator] = useState<string>(() => localStorage.getItem('bible_desc_separator') || ':');
  const [descPosition, setDescPosition] = useState<string>(() => localStorage.getItem('bible_desc_position') || 'top_separate');
  const [descShowVersion, setDescShowVersion] = useState<boolean>(() => {
    const val = localStorage.getItem('bible_desc_show_version');
    return val === null ? true : val === 'true';
  });
  const [descAlignment, setDescAlignment] = useState<string>(() => localStorage.getItem('bible_desc_alignment') || 'inherited');
  const [descLineHeight, setDescLineHeight] = useState<number>(() => {
    const val = localStorage.getItem('bible_desc_line_height');
    return val ? parseInt(val, 10) : 8;
  });

  // Bible Layout Template state
  const [bibleLayout, setBibleLayout] = useState<BibleLayoutId>(() => {
    return (localStorage.getItem('bible_layout') as BibleLayoutId) || 'standard';
  });

  // Track state sync with localStorage
  useEffect(() => {
    localStorage.setItem('bible_desc_style', descStyle);
  }, [descStyle]);
  useEffect(() => {
    localStorage.setItem('bible_desc_separator', descSeparator);
  }, [descSeparator]);
  useEffect(() => {
    localStorage.setItem('bible_desc_position', descPosition);
  }, [descPosition]);
  useEffect(() => {
    localStorage.setItem('bible_desc_show_version', String(descShowVersion));
  }, [descShowVersion]);
  useEffect(() => {
    localStorage.setItem('bible_desc_alignment', descAlignment);
  }, [descAlignment]);
  useEffect(() => {
    localStorage.setItem('bible_desc_line_height', String(descLineHeight));
  }, [descLineHeight]);

  useEffect(() => {
    localStorage.setItem('bible_layout', bibleLayout);
  }, [bibleLayout]);

  // Blind typing fast lookup buffer state & timeout ref
  const [lookupBuffer, setLookupBuffer] = useState<string>('');
  const bufferTimeoutRef = React.useRef<any>(null);

  const getTranslationLabel = (translation: string) => {
    if (translation === 'NONE') return 'None';
    if (translation === 'XML') return xmlFileName || 'Loaded XML';
    if (translation.startsWith('xml-')) {
      const bibleId = translation.replace('xml-', '');
      const bible = loadedBibles.find(b => b.id === bibleId);
      return bible ? bible.name : 'XML Bible';
    }
    return translation;
  };

  // Retrieves clean verse text, checking the uploaded Bible XML first
  const getVerseText = (book: BibleBookInfo, chapter: number, verse: number, translation: string) => {
    if (!translation || translation === 'NONE') {
      return `Please import or select your XML Bible file under Configuration (⚙️).`;
    }
    if (translation.startsWith('xml-')) {
      const bibleId = translation.replace('xml-', '');
      const bible = loadedBibles.find(b => b.id === bibleId);
      if (bible) {
        const key = `${book.id}-${chapter}-${verse}`;
        if (bible.database[key]) {
          return bible.database[key];
        }
      }
      return `[${book.english} ${chapter}:${verse}] Verse translation not found in loaded XML.`;
    }
    if (translation === 'XML') {
      if (parsedBibleDatabase) {
        const key = `${book.id}-${chapter}-${verse}`;
        if (parsedBibleDatabase[key]) {
          return parsedBibleDatabase[key];
        }
      }
      return `[${book.english} ${chapter}:${verse}] Verse translation not found in loaded XML.`;
    }
    return `[${translation}] Verse translation not found.`;
  };

  // Formats active presentation text and footer copyright reference based on Verse Description configurations
  const getFormattedProjectionAndLabel = useCallback((book: BibleBookInfo, chapter: number, verseNum: number) => {
    // 1. Get raw primary translation and secondary translation verses
    const primaryText = getVerseText(book, chapter, verseNum, primaryTranslation);
    const refText = referenceTranslation === 'NONE' ? '' : getVerseText(book, chapter, verseNum, referenceTranslation as any);

    // 2. Format the book name part based on style configurations
    let bookName = '';
    if (descStyle === 'bilingual') {
      bookName = `${book.tamil} (${book.english})`;
    } else if (descStyle === 'tamil') {
      bookName = book.tamil;
    } else if (descStyle === 'english') {
      bookName = book.english;
    } else if (descStyle === 'abbr') {
      // Standard Bible abbreviation
      bookName = book.english.length > 5 ? book.english.substring(0, 3) + '.' : book.english;
    } else {
      bookName = `${book.tamil} (${book.english})`;
    }

    // 3. Version label suffix if enabled
    let versionSuffix = '';
    if (descShowVersion) {
      const prim = getTranslationLabel(primaryTranslation);
      if (prim !== 'None') {
        if (referenceTranslation !== 'NONE') {
          const ref = getTranslationLabel(referenceTranslation);
          versionSuffix = ` [${prim}/${ref}]`;
        } else {
          versionSuffix = ` [${prim}]`;
        }
      }
    }

    // Build citation label and verse text based on selected layout template
    let formattedRef = '';
    let versePrefixText = '';
    let effectivePosition = descPosition;

    switch (bibleLayout) {
      case 'standard':
        formattedRef = `${bookName} ${chapter}${descSeparator}${verseNum}${versionSuffix}`;
        versePrefixText = '';
        break;
      case 'versePrefix':
        formattedRef = `${bookName} ${chapter}${versionSuffix}`;
        versePrefixText = `${verseNum} `;
        effectivePosition = 'top_separate';
        break;
      case 'inlineRef':
        formattedRef = `${bookName}${versionSuffix}`;
        versePrefixText = `${chapter}${descSeparator}${verseNum} `;
        effectivePosition = 'top_separate';
        break;
      case 'bottomRef':
        formattedRef = `${bookName} ${chapter}${descSeparator}${verseNum}${versionSuffix}`;
        versePrefixText = '';
        effectivePosition = 'bottom_separate';
        break;
      case 'compact':
        formattedRef = versionSuffix.trim();
        versePrefixText = `${verseNum} `;
        effectivePosition = 'hidden';
        break;
      case 'devotional':
        formattedRef = `\u2014 ${bookName} ${chapter}${descSeparator}${verseNum}${versionSuffix}`;
        versePrefixText = '';
        effectivePosition = 'bottom_separate';
        break;
    }

    // Apply verse prefix to text
    let finalPrimary = versePrefixText + primaryText;
    let finalRef = refText ? versePrefixText + refText : '';

    // Apply alignment markers/markup if left/right are explicitly specified
    if (descAlignment === 'left') {
      finalPrimary = `⫷ ${finalPrimary}`;
      if (finalRef) finalRef = `⫷ ${finalRef}`;
    } else if (descAlignment === 'right') {
      finalPrimary = `${finalPrimary} ⫸`;
      if (finalRef) finalRef = `${finalRef} ⫸`;
    }

    // Store effective descPosition for projection reference
    const projectedPosition = effectivePosition;

    // 4. Implement strict pagination rules (Prevent text shrinking, max 30 words per slide, split on grammatical breaks with top-anchored reference)
    const getWordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

    const combinedText = finalRef ? `${finalPrimary}\n${finalRef}` : finalPrimary;

    if (!biblePaginationEnabled) {
      return { text: `[Slide 1]\n${combinedText}`, label: formattedRef, descPosition: effectivePosition };
    }

    // Split text into segments based on punctuation and coordinate conjunctions to find logical grammatical breaks
    const parts = combinedText.split(/([\.\?!;:]+|,|\b(?:and|or|but|so|for|yet|nor)\b)/i);
    const segments: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      if (/^([\.\?!;:]+|,|\b(?:and|or|but|so|for|yet|nor)\b)$/i.test(part.trim())) {
        if (segments.length > 0) {
          segments[segments.length - 1] += part;
        } else {
          segments.push(part);
        }
      } else {
        segments.push(part);
      }
    }

    // Group segments into safety slices of at most 30 words per slide block
    const finalSlides: string[] = [];
    let currentSlideSegments: string[] = [];
    let currentWordCount = 0;

    for (const segment of segments) {
      const segWordCount = getWordCount(segment);
      if (segWordCount === 0) continue;

      if (currentWordCount + segWordCount <= 30) {
        currentSlideSegments.push(segment);
        currentWordCount += segWordCount;
      } else {
        if (currentSlideSegments.length > 0) {
          finalSlides.push(currentSlideSegments.join("").trim());
          currentSlideSegments = [];
          currentWordCount = 0;
        }

        if (segWordCount > 30) {
          const words = segment.trim().split(/\s+/);
          for (let idx = 0; idx < words.length; idx += 30) {
            const chunkWords = words.slice(idx, idx + 30);
            finalSlides.push(chunkWords.join(" "));
          }
        } else {
          currentSlideSegments.push(segment);
          currentWordCount = segWordCount;
        }
      }
    }

    if (currentSlideSegments.length > 0) {
      finalSlides.push(currentSlideSegments.join("").trim());
    }

    if (finalSlides.length === 0) {
      finalSlides.push(combinedText);
    }

    // Format slides exactly into the strict requested outputs with top-anchored Reference
    const outputString = finalSlides
      .map((slideText, idx) => {
        return `[Slide ${idx + 1}]\n${slideText}`;
      })
      .join('\n\n');

    return { text: outputString, label: formattedRef, descPosition: effectivePosition };
  }, [primaryTranslation, referenceTranslation, descStyle, descSeparator, descPosition, descShowVersion, descAlignment, loadedBibles, xmlFileName, getTranslationLabel, biblePaginationEnabled, bibleLayout]);

  const updateLookupBuffer = (updater: string | ((prev: string) => string)) => {
    setLookupBuffer(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });

    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
    }
    bufferTimeoutRef.current = setTimeout(() => {
      setLookupBuffer('');
    }, 1500);
  };

  // Blind Typing Parsing Algorithm
  const parseBlindTypingString = (text: string) => {
    const normStr = text.trim().toLowerCase();
    if (!normStr) return null;

    // Pattern matching [Book] [Chapter] [Verse] with flexibility
    const regex = /^\s*([1-3]\s*)?([a-zA-Z\u0B80-\u0BFF\u00a0]+)\s*(\d+)(?:[\s:,-]+(\d+))?\s*$/i;
    const match = normStr.match(regex);
    if (!match) return null;

    const numPrefix = match[1] ? match[1].trim() : '';
    const searchBookPart = (numPrefix + match[2]).trim();
    const chapParsed = parseInt(match[3], 10);
    const verseParsed = match[4] ? parseInt(match[4], 10) : null;

    const book = getBookInfo(searchBookPart);
    if (book) {
      return { book, chapter: chapParsed, verse: verseParsed };
    }
    return null;
  };

  // Effect to perform the routing on lookupBuffer updates
  useEffect(() => {
    if (!lookupBuffer) return;
    const parsed = parseBlindTypingString(lookupBuffer);
    if (parsed) {
      const { book, chapter, verse } = parsed;
      if (chapter > 0 && chapter <= book.chaptersCount) {
        setActiveBookId(book.id);
        setActiveChapter(chapter);
        if (verse !== null) {
          // Dynamic calculated verse matching offline check
          const base = 20;
          const modifier = (book.english.length * 3 + chapter * 7) % 21;
          const maxVersesInChap = base + modifier;
          if (verse > 0 && verse <= maxVersesInChap) {
            setActiveVerse(verse);
            // Instantly project/activate so the operator has immediate feedback
            setTimeout(() => {
              const { text: projectionString, label: referenceLabel, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(book, chapter, verse);
              onProjectText(projectionString, referenceLabel, projectedDescPosition);
              setIsLiveActive(true);
            }, 50);

            // Clear buffer immediately upon complete valid verse match
            setLookupBuffer('');
            if (bufferTimeoutRef.current) {
              clearTimeout(bufferTimeoutRef.current);
            }
          }
        } else {
          setActiveVerse(1);
        }
      }
    }
  }, [lookupBuffer, getFormattedProjectionAndLabel]);

  // Global keydown listener for Blind typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key.length === 1) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const char = e.key;
        if (/[a-zA-Z0-9\s:,-]/i.test(char) || (char.charCodeAt(0) >= 0x0B80 && char.charCodeAt(0) <= 0x0BFF)) {
          e.preventDefault();
          updateLookupBuffer(prev => prev + char);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        updateLookupBuffer(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        updateLookupBuffer('');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Active scrolling focus link
  const activeItemRef = React.useRef<HTMLDivElement | null>(null);

  // Find active book metadata
  const activeBook = useMemo(() => {
    return BIBLE_BOOKS_METADATA.find(b => b.id === activeBookId) || BIBLE_BOOKS_METADATA[0];
  }, [activeBookId]);

  // Handle book category filter search
  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return BIBLE_BOOKS_METADATA;
    const query = searchQuery.toLowerCase();
    return BIBLE_BOOKS_METADATA.filter(b => 
      b.english.toLowerCase().includes(query) || 
      b.tamil.toLowerCase().includes(query) || 
      b.tamilAbbrev.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Determine number of verses dynamically for active book & chapter
  const versesInChapterCount = useMemo(() => {
    let currentDb = parsedBibleDatabase;
    if (primaryTranslation.startsWith('xml-')) {
      const bibleId = primaryTranslation.replace('xml-', '');
      const bible = loadedBibles.find(b => b.id === bibleId);
      if (bible) {
        currentDb = bible.database;
      }
    }
    if (currentDb) {
      let maxVerse = 0;
      const prefix = `${activeBook.id}-${activeChapter}-`;
      Object.keys(currentDb).forEach(key => {
        if (key.startsWith(prefix)) {
          const verseNum = parseInt(key.replace(prefix, ''), 10);
          if (!isNaN(verseNum) && verseNum > maxVerse) {
            maxVerse = verseNum;
          }
        }
      });
      if (maxVerse > 0) return maxVerse;
    }
    // Fallback to offline deterministic formulation
    const base = 20;
    const modifier = (activeBook.english.length * 3 + activeChapter * 7) % 21;
    return base + modifier;
  }, [activeBook, activeChapter, parsedBibleDatabase, primaryTranslation, loadedBibles]);

  // Generates complete verse objects for custom sidebar layout rendering
  const versesList = useMemo(() => {
    const list = [];
    for (let i = 1; i <= versesInChapterCount; i++) {
      list.push({
        num: i,
        primaryText: getVerseText(activeBook, activeChapter, i, primaryTranslation),
        refText: referenceTranslation === 'NONE' ? '' : getVerseText(activeBook, activeChapter, i, referenceTranslation as any)
      });
    }
    return list;
  }, [activeBook, activeChapter, versesInChapterCount, primaryTranslation, referenceTranslation, parsedBibleDatabase]);

  // Map to speed up checking if a verse is saved/bookmarked
  const isVerseSavedMap = useMemo(() => {
    const map = new Set<number>();
    if (savedVerses) {
      savedVerses.forEach(sv => {
        if (sv.bookId === activeBook.id && sv.chapter === activeChapter) {
          map.add(sv.verse);
        }
      });
    }
    return map;
  }, [savedVerses, activeBook.id, activeChapter]);

  // Keeps verse selected bounds safe if book jumps
  useEffect(() => {
    if (activeChapter > activeBook.chaptersCount) {
      setActiveChapter(1);
    }
    setActiveVerse(1);
  }, [activeBookId]);

  useEffect(() => {
    if (activeVerse > versesInChapterCount) {
      setActiveVerse(1);
    }
  }, [activeChapter]);

  // Synchronize active list item viewport position
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeVerse]);

  // Ref to hold current navigation state to allow buttery-smooth rapid arrow-key navigation (autorepeat)
  const navStateRef = React.useRef({
    activeBook,
    activeChapter,
    activeVerse,
    versesInChapterCount,
    primaryTranslation,
    referenceTranslation,
  });

  // Keep it synchronized with state on every render
  useEffect(() => {
    navStateRef.current = {
      activeBook,
      activeChapter,
      activeVerse,
      versesInChapterCount,
      primaryTranslation,
      referenceTranslation,
    };
  }, [activeBook, activeChapter, activeVerse, versesInChapterCount, primaryTranslation, referenceTranslation]);

  const mountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Trigger projecting active verse content safely to Live monitor & Fullscreen system
  const handleTriggerProjectVerse = useCallback((verseNum: number, customBook?: BibleBookInfo, customChapter?: number) => {
    const book = customBook || activeBook;
    const chapter = customChapter !== undefined ? customChapter : activeChapter;

    // Set the state
    setActiveVerse(verseNum);
    if (customBook) {
      setActiveBookId(customBook.id);
    }
    if (customChapter !== undefined) {
      setActiveChapter(customChapter);
    }

    // Trigger external notification for history tracking
    if (onVerseSelected) {
      onVerseSelected(book.id, book.english, chapter, verseNum);
    }

    // Generate text immediately, bypassing any React commit render delays
    const { text: projectionString, label: referenceLabel, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(book, chapter, verseNum);

    onProjectText(projectionString, referenceLabel, projectedDescPosition);
    setIsLiveActive(true);

    // Save to logs
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoryLog(prev => [
      { book: book.english, chapter: chapter, verse: verseNum, time: logTime },
      ...prev.slice(0, 9) // keep last 10
    ]);
  }, [activeBook, activeChapter, onVerseSelected, getFormattedProjectionAndLabel, onProjectText, descPosition]);

  // Synchronize on-screen projection in real-time whenever configuration or active verse changes
  useEffect(() => {
    if (isLiveActive) {
      const { text: projectionString, label: referenceLabel, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(activeBook, activeChapter, activeVerse);
      onProjectText(projectionString, referenceLabel, projectedDescPosition);
    }
  }, [
    isLiveActive,
    activeBook,
    activeChapter,
    activeVerse,
    primaryTranslation,
    referenceTranslation,
    bibleLayout,
    descStyle,
    descSeparator,
    descPosition,
    descShowVersion,
    descAlignment,
    getFormattedProjectionAndLabel,
    onProjectText
  ]);

  // Synchronize on external jumps
  useEffect(() => {
    if (propActiveBookId !== undefined && propActiveChapter !== undefined && propActiveVerse !== undefined) {
      const book = BIBLE_BOOKS_METADATA.find(b => b.id === propActiveBookId) || activeBook;
      const { text: projectionString, label: referenceLabel, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(book, propActiveChapter, propActiveVerse);
      onProjectText(projectionString, referenceLabel, projectedDescPosition);
      setIsLiveActive(true);
    }
  }, [propActiveBookId, propActiveChapter, propActiveVerse, activeBook, getFormattedProjectionAndLabel, onProjectText, descPosition, setIsLiveActive]);

  const handleNextVerse = useCallback(() => {
    const { activeVerse: currVerse, activeChapter: currChap, versesInChapterCount: maxVerse, activeBook: currBook } = navStateRef.current;

    if (currVerse < maxVerse) {
      const nextVerse = currVerse + 1;
      navStateRef.current.activeVerse = nextVerse;
      handleTriggerProjectVerse(nextVerse, currBook, currChap);
    } else if (currChap < currBook.chaptersCount) {
      const nextChap = currChap + 1;

      // Speculatively determine verses count in next chapter of current book
      let nextVersesCount = 0;
      let currentDb = parsedBibleDatabase;
      if (primaryTranslation.startsWith('xml-')) {
        const bibleId = primaryTranslation.replace('xml-', '');
        const bible = loadedBibles.find(b => b.id === bibleId);
        if (bible) {
          currentDb = bible.database;
        }
      }
      if (currentDb) {
        let maxV = 0;
        const prefix = `${currBook.id}-${nextChap}-`;
        Object.keys(currentDb).forEach(key => {
          if (key.startsWith(prefix)) {
            const vNum = parseInt(key.replace(prefix, ''), 10);
            if (!isNaN(vNum) && vNum > maxV) {
              maxV = vNum;
            }
          }
        });
        if (maxV > 0) nextVersesCount = maxV;
      }
      if (nextVersesCount === 0) {
        const base = 20;
        const modifier = (currBook.english.length * 3 + nextChap * 7) % 21;
        nextVersesCount = base + modifier;
      }

      navStateRef.current.activeChapter = nextChap;
      navStateRef.current.activeVerse = 1;
      navStateRef.current.versesInChapterCount = nextVersesCount;

      handleTriggerProjectVerse(1, currBook, nextChap);
    }
  }, [parsedBibleDatabase, primaryTranslation, referenceTranslation, loadedBibles, handleTriggerProjectVerse]);

  const handlePrevVerse = useCallback(() => {
    const { activeVerse: currVerse, activeChapter: currChap, versesInChapterCount: maxVerse, activeBook: currBook } = navStateRef.current;

    if (currVerse > 1) {
      const prevVerse = currVerse - 1;
      navStateRef.current.activeVerse = prevVerse;
      handleTriggerProjectVerse(prevVerse, currBook, currChap);
    } else if (currChap > 1) {
      const prevChap = currChap - 1;

      // Speculatively determine verses count in previous chapter of current book
      let prevVersesCount = 0;
      let currentDb = parsedBibleDatabase;
      if (primaryTranslation.startsWith('xml-')) {
        const bibleId = primaryTranslation.replace('xml-', '');
        const bible = loadedBibles.find(b => b.id === bibleId);
        if (bible) {
          currentDb = bible.database;
        }
      }
      if (currentDb) {
        let maxV = 0;
        const prefix = `${currBook.id}-${prevChap}-`;
        Object.keys(currentDb).forEach(key => {
          if (key.startsWith(prefix)) {
            const vNum = parseInt(key.replace(prefix, ''), 10);
            if (!isNaN(vNum) && vNum > maxV) {
              maxV = vNum;
            }
          }
        });
        if (maxV > 0) prevVersesCount = maxV;
      }
      if (prevVersesCount === 0) {
        const base = 20;
        const modifier = (currBook.english.length * 3 + prevChap * 7) % 21;
        prevVersesCount = base + modifier;
      }

      navStateRef.current.activeChapter = prevChap;
      navStateRef.current.activeVerse = prevVersesCount;
      navStateRef.current.versesInChapterCount = prevVersesCount;

      handleTriggerProjectVerse(prevVersesCount, currBook, prevChap);
    }
  }, [parsedBibleDatabase, primaryTranslation, referenceTranslation, loadedBibles, handleTriggerProjectVerse]);

  // Safe and non-blocking XML File Uploader handler
  const handleXMLUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setXmlError(null);
    setXmlFileName(file.name);
    setXmlProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const textStr = event.target?.result as string;
        if (!textStr) throw new Error('Could not read XML file contents.');

        const verses = await parseBibleXML(textStr, (prog) => {
          setXmlProgress(prog);
        });
        console.log(`Bible import: parsed ${verses.length} verses from XML`);
        if (!mountedRef.current) return;

        // Convert parsed raw structure to ultra-fast lookup key-value map
        const db: { [key: string]: string } = {};
        const unmatchedBooks = new Set<string>();
        verses.forEach(v => {
          let bookInfo = getBookInfo(v.book);
          // Fallback: try numeric book number if name lookup failed
          if (!bookInfo && v.bookNumber) {
            bookInfo = getBookInfo(String(v.bookNumber));
          }
          if (bookInfo) {
            const key = `${bookInfo.id}-${v.chapter}-${v.verse}`;
            db[key] = v.text;
          } else {
            unmatchedBooks.add(`${v.book}${v.bookNumber ? ` (bnumber=${v.bookNumber})` : ''}`);
          }
        });
        if (unmatchedBooks.size > 0) {
          const sample = Array.from(unmatchedBooks).slice(0, 10).join(', ');
          console.warn(`Bible import: ${unmatchedBooks.size} book names could not be mapped: ${sample}${unmatchedBooks.size > 10 ? '...' : ''}`);
          setXmlError(`⚠️ ${unmatchedBooks.size} book names weren't recognized (e.g. "${Array.from(unmatchedBooks)[0]}"). Some verses may be missing.`);
        }
        if (Object.keys(db).length === 0) {
          const errMsg = unmatchedBooks.size > 0
            ? 'No verses were imported — all book names were unrecognized. Try a different XML file format.'
            : 'No verses found in this XML. The file format may not be supported. Try Zefania or OpenSong format.';
          setXmlError(errMsg);
          setXmlProgress(null);
          return;
        }

        const newBibleId = `xml-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newBible = {
          id: newBibleId,
          name: file.name.replace(/\.[^/.]+$/, ""), // remove extension for user friendliness
          database: db
        };

        // Persist to indexedDB for persistence across page reloads
        await saveBibleToDB(newBible);
        if (!mountedRef.current) return;

        setLoadedBibles(prev => [...prev, newBible]);
        setParsedBibleDatabase(db);
        setXmlProgress(null);
        setPrimaryTranslation(`xml-${newBibleId}`); // auto-select loaded XML primary track
      } catch (err: any) {
        console.error(err);
        setXmlError(err.message || 'Error processing Bible XML.');
        setXmlProgress(null);
        setXmlFileName('');
      }
    };
    reader.onerror = () => {
      setXmlError('Failed reading XML local file stream.');
      setXmlProgress(null);
      setXmlFileName('');
    };
    reader.readAsText(file);
  };

  // Keyboard Arrow Key Navigation System inside the Bible View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keypresses if user is typing in search or any input
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleNextVerse();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          handlePrevVerse();
          break;

        case 'ArrowUp':
          e.preventDefault(); // Intercept browser scroll jumps in active viewport list
          handlePrevVerse();
          break;

        case 'ArrowDown':
          e.preventDefault(); // Intercept browser scroll jumps in active viewport list
          handleNextVerse();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextVerse, handlePrevVerse]);

  const parsedLookupResult = useMemo(() => {
    if (!searchQuery.trim() || bibleTab !== 'search') return null;
    const q = searchQuery.trim();
    
    // Pattern to match book, chapter, optional verse
    const regex = /^\s*([1-3]\s*)?([a-zA-Z\u0B80-\u0BFF\s\.\u00a0]+?)\s*(\d+)(?:\s*[:\s-]\s*(\d+))?\s*$/i;
    const match = q.match(regex);
    if (!match) return null;

    const prefix = match[1] || '';
    const bookNameQuery = (prefix + (match[2] || '')).trim();
    const chapterNum = parseInt(match[3], 10);
    const verseNum = match[4] ? parseInt(match[4], 10) : 1;

    const book = getBookInfo(bookNameQuery);
    if (book && chapterNum > 0 && chapterNum <= book.chaptersCount) {
      return { book, chapter: chapterNum, verse: verseNum };
    }
    return null;
  }, [searchQuery, bibleTab]);

  const keywordSearchResults = useMemo(() => {
    if (!searchQuery.trim() || bibleTab !== 'search' || parsedLookupResult) return [];
    const query = searchQuery.trim().toLowerCase();
    
    const results: { bookId: string; bookName: string; chapter: number; verse: number; primaryText: string; refText: string }[] = [];
    
    // Check if we have an active primary XML bible loaded
    const primaryBibleId = primaryTranslation.startsWith('xml-') ? primaryTranslation.replace('xml-', '') : null;
    const activePrimaryBible = primaryBibleId ? loadedBibles.find(b => b.id === primaryBibleId) : (loadedBibles[0] || null);
    
    const refBibleId = referenceTranslation.startsWith('xml-') ? referenceTranslation.replace('xml-', '') : null;
    const activeRefBible = refBibleId ? loadedBibles.find(b => b.id === refBibleId) : null;
    
    if (activePrimaryBible) {
      const db = activePrimaryBible.database;
      Object.keys(db).forEach(key => {
        const text = db[key];
        if (text.toLowerCase().includes(query)) {
          const parts = key.split('-');
          if (parts.length === 3) {
            const bookId = parts[0];
            const chapter = parseInt(parts[1], 10);
            const verse = parseInt(parts[2], 10);
            const book = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
            if (book) {
              results.push({
                bookId,
                bookName: `${book.tamil} (${book.english})`,
                chapter,
                verse,
                primaryText: text,
                refText: activeRefBible ? (activeRefBible.database[key] || '') : ''
              });
            }
          }
        }
      });
    } else {
      Object.keys(POPULAR_VERSES_DB).forEach(key => {
        const item = POPULAR_VERSES_DB[key];
        if (item.tamil.toLowerCase().includes(query) || item.english.toLowerCase().includes(query)) {
          const parts = key.split('-');
          const bookId = parts[0];
          const chapter = parseInt(parts[1], 10);
          const verse = parseInt(parts[2], 10);
          const book = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
          if (book) {
            results.push({
              bookId,
              bookName: `${book.tamil} (${book.english})`,
              chapter,
              verse,
              primaryText: item.tamil,
              refText: item.english
            });
          }
        }
      });
    }
    
    return results.slice(0, 100); // limit results
  }, [searchQuery, bibleTab, loadedBibles, primaryTranslation, referenceTranslation, parsedLookupResult]);

  const activeVerseText = useMemo(() => {
    const current = versesList.find(v => v.num === activeVerse);
    if (!current) return '';
    return current.refText ? `${current.primaryText}\n${current.refText}` : current.primaryText;
  }, [versesList, activeVerse]);

  return (
    <div className="flex-1 flex min-h-0 bg-neutral-900 h-full select-none" id="bible-grid-dashboard">
      
      {/* COMPONENT 1: LEFT SIDEBAR (VerseListSidebar) */}
      <div className="w-[320px] bg-neutral-950 border-r border-zinc-800 flex flex-col h-full shrink-0" id="verse-list-sidebar">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-805 bg-neutral-905/60 shrink-0 select-none">
          <div className="py-3 px-3.5 bg-black/65 rounded-xl border border-zinc-850/80 text-center flex items-center justify-center gap-2 text-orange-400">
            <Book className="w-4 h-4 shrink-0 text-orange-550" />
            <span className="text-xs sm:text-sm font-bold tracking-wide text-zinc-100 font-sans">
              {activeBook.tamil} {activeChapter}:{activeVerse} <span className="text-[11px] text-zinc-500 font-mono font-medium ml-1">({activeBook.english})</span>
            </span>
          </div>
        </div>

        {/* Warning banner when no XML is loaded */}
        {loadedBibles.length === 0 && (
          <div className="mx-3 my-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 animate-pulse">
            <h5 className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <span>⚠️ No Bible XML Loaded</span>
            </h5>
            <p className="text-[10px] text-zinc-400 font-sans leading-normal">
              Click the <b>Settings (⚙️)</b> button above to load Zefania, EasySlides, or OpenLyrics XML files.
            </p>
          </div>
        )}

        {/* Verse Items List Body [Scrollable] */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar bg-neutral-950/60">
          {versesList.map((verse) => (
            <VerseItem
              key={verse.num}
              num={verse.num}
              primaryText={verse.primaryText}
              refText={verse.refText}
              isActive={activeVerse === verse.num}
              onClick={() => handleTriggerProjectVerse(verse.num)}
              itemRef={activeVerse === verse.num ? activeItemRef : undefined}
              isSaved={isVerseSavedMap.has(verse.num)}
              onToggleSave={() => onToggleSaveVerse?.(activeBook.id, activeBook.english, activeChapter, verse.num, verse.primaryText, verse.refText)}
            />
          ))}
        </div>



      </div>

      {/* COMPONENT 2: THE RIGHT MAIN AREA (GridNavigator) */}
      <div className="flex-1 flex flex-col min-h-0 bg-neutral-900 overflow-hidden" id="grid-navigator">
        
        {/* UPPERMOST TABS PANEL */}
        <div className="flex items-center justify-between px-5 py-3 bg-neutral-950 border-b border-zinc-900/80 shrink-0 select-none">
          <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850/60">
            <button
              onClick={() => {
                setBibleTab('browse');
                setSearchQuery('');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono font-extrabold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                bibleTab === 'browse' 
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700/60 ring-1 ring-orange-500/10' 
                  : 'text-zinc-500 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>📖 Browse Catalog</span>
            </button>
            <button
              onClick={() => {
                setBibleTab('search');
                setSearchQuery('');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono font-extrabold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                bibleTab === 'search' 
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700/60 ring-1 ring-orange-500/10' 
                  : 'text-zinc-500 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>🔍 KEYWORD SEARCH</span>
            </button>
          </div>

          {/* Right side filler */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-orange-400 transition-all cursor-pointer"
              title="Bible Configuration — import XML Bibles, adjust verse display"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {bibleTab === 'browse' ? (
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
                    {activeBook.english} • {activeBook.chaptersCount} Chs
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
                        <div className="col-span-full py-6 text-center text-[10px] text-zinc-600 font-mono italic">
                          Choose a book to load chapters
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane (Verses Grid) */}
              <div className="flex-1 flex flex-col p-4 pt-3 min-h-0 bg-neutral-900/10">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <h3 className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-zinc-400">
                    Verses Selector
                  </h3>
                  <span className="text-[9.5px] font-bold text-zinc-550 uppercase">
                    CH {activeChapter} • {versesInChapterCount} Verses
                  </span>
                </div>

                <div className="flex-1 bg-zinc-950/45 border border-zinc-850/60 rounded-xl p-3 overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-1 custom-scrollbar min-h-0">
                    <div className="biblegrid-verses">
                      {activeBook && activeChapter ? (
                        Array.from({ length: versesInChapterCount }).map((_, idx) => {
                          const verseNum = idx + 1;
                          const isSelected = activeVerse === verseNum;
                          return (
                            <button
                              key={verseNum}
                              onClick={() => {
                                handleTriggerProjectVerse(verseNum);
                              }}
                              className={`biblegrid-cell biblegrid-number ${isSelected ? 'active' : ''}`}
                            >
                              {verseNum}
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-6 text-center text-[10px] text-zinc-600 font-mono italic">
                          Choose a chapter to load verses
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          /* KEYWORD & CITATION SEARCH PANEL */
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
                        
                        // Formatted projection output
                        const { text, label, descPosition: projectedDescPosition } = getFormattedProjectionAndLabel(book, chapter, verse);
                        
                        onProjectText(text, label, projectedDescPosition);
                        setIsLiveActive(true);
                        setBibleTab('browse'); // Back to browse grid
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
                          setBibleTab('browse'); // Back to browse grid
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
        )}



        {/* Transient Toast Overlay for blind typing keystroke interceptor status */}
        {lookupBuffer && (
          <div className="absolute bottom-16 right-6 bg-zinc-950/90 border border-orange-500/40 text-orange-400 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 z-50 animate-bounce duration-300 font-sans tracking-wide">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse shadow shadow-orange-500/50" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Fast Lookup</span>
              <span className="text-sm font-mono font-extrabold whitespace-nowrap">Typing: <span className="text-white bg-zinc-900 px-1.5 py-0.5 rounded ml-1 border border-zinc-800">{lookupBuffer}</span></span>
            </div>
          </div>
        )}

      </div>

      {/* Sleek, Modern Configuration Modal Dialog Overlay */}
      {isConfigOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          id="bible-config-modal-overlay"
          onClick={() => setIsConfigOpen(false)}
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
                onClick={() => setIsConfigOpen(false)}
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
                        <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bibleHeadingFontSize}px</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="48"
                        step="1"
                        value={bibleHeadingFontSize}
                        onChange={(e) => setBibleHeadingFontSize(Number(e.target.value))}
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
                            value={bibleHeadingFontColor}
                            onChange={(e) => setBibleHeadingFontColor(e.target.value)}
                            className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] font-mono text-zinc-350">{bibleHeadingFontColor}</span>
                        </div>
                      </div>

                      {/* Background Color */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Background Color</span>
                        <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                          <input 
                            type="color"
                            value={bibleHeadingBgColor}
                            onChange={(e) => setBibleHeadingBgColor(e.target.value)}
                            className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] font-mono text-zinc-350">{bibleHeadingBgColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Background Opacity */}
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-sans">Background Opacity</span>
                        <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bibleHeadingBgOpacity}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={bibleHeadingBgOpacity}
                        onChange={(e) => setBibleHeadingBgOpacity(Number(e.target.value))}
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
                        <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bibleVerseFontSize}px</span>
                      </div>
                      <input 
                        type="range"
                        min="16"
                        max="72"
                        step="1"
                        value={bibleVerseFontSize}
                        onChange={(e) => setBibleVerseFontSize(Number(e.target.value))}
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
                            value={bibleVerseFontColor}
                            onChange={(e) => setBibleVerseFontColor(e.target.value)}
                            className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] font-mono text-zinc-350">{bibleVerseFontColor}</span>
                        </div>
                      </div>

                      {/* Background Color */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider">Background Color</span>
                        <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 border border-zinc-900 rounded-xl">
                          <input 
                            type="color"
                            value={bibleVerseBgColor}
                            onChange={(e) => setBibleVerseBgColor(e.target.value)}
                            className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <span className="text-[11px] font-mono text-zinc-350">{bibleVerseBgColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Background Opacity */}
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-sans">Background Opacity</span>
                        <span className="text-[11px] font-mono font-bold text-orange-400 bg-zinc-950 px-1.5 py-0.5 rounded">{bibleVerseBgOpacity}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={bibleVerseBgOpacity}
                        onChange={(e) => setBibleVerseBgOpacity(Number(e.target.value))}
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
                onClick={() => setIsConfigOpen(false)}
                className="bg-orange-500 hover:bg-orange-600 text-black border-0 font-sans text-xs font-extrabold uppercase px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-orange-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                id="bible-config-save-btn"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
