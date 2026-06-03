import { BIBLE_BOOKS_METADATA, BibleBookInfo } from '../lib/bibleMetadata';

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  bookNumber?: number;
}

const BIBLE_BOOK_ALIASES: Record<string, string[]> = {
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

function getBookInfo(xmlBookName: string): BibleBookInfo | undefined {
  const name = xmlBookName.trim().toLowerCase();
  if (!name) return undefined;

  const cleanStr = (s: string) => s.replace(/[\s\-_\.]/g, '').toLowerCase();
  const cleanedName = cleanStr(name);

  const bookNum = parseInt(cleanedName, 10);
  if (!isNaN(bookNum) && bookNum >= 1 && bookNum <= 66) {
    const match = BIBLE_BOOKS_METADATA.find(b => b.bookNumber === bookNum);
    if (match) return match;
  }

  let match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.id) === cleanedName);
  if (match) return match;

  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    const found = aliases.some(a => cleanStr(a) === cleanedName);
    if (found) return BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
  }

  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    const found = aliases.some(a => cleanStr(a).includes(cleanedName) || cleanedName.includes(cleanStr(a)));
    if (found) return BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
  }

  const getLevenshteinDistance = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  };

  let minDistance = Infinity;
  let bestMatch: BibleBookInfo | undefined;

  for (const book of BIBLE_BOOKS_METADATA) {
    const cleanEng = cleanStr(book.english);
    const dist = getLevenshteinDistance(cleanedName, cleanEng);
    const allowedDistance = cleanedName.length <= 4 ? 1 : 2;
    if (dist <= allowedDistance && dist < minDistance) {
      minDistance = dist;
      bestMatch = book;
    }
  }

  if (bestMatch) return bestMatch;
  return undefined;
}

function parseBibleXML(xmlString: string, onProgress: (progress: number) => void): ParsedVerse[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML Parsing Error: ' + parserError.textContent);
  }

  const parsedVerses: ParsedVerse[] = [];

  let bookElements = Array.from(xmlDoc.getElementsByTagName('BIBLEBOOK'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('biblebook'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('book'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('Book'));
  if (bookElements.length === 0) bookElements = Array.from(xmlDoc.getElementsByTagName('b'));
  if (bookElements.length === 0) {
    const divs = Array.from(xmlDoc.getElementsByTagName('div'));
    bookElements = divs.filter(el => {
      const t = (el.getAttribute('type') || '').toLowerCase();
      return t === 'book' || el.hasAttribute('osisID');
    });
  }

  if (bookElements.length === 0) {
    let verses = Array.from(xmlDoc.getElementsByTagName('verse'));
    if (verses.length === 0) verses = Array.from(xmlDoc.getElementsByTagName('VERS'));
    if (verses.length === 0) verses = Array.from(xmlDoc.getElementsByTagName('v'));

    for (let i = 0; i < verses.length; i++) {
      if (i > 0 && i % 1000 === 0) {
        onProgress(Math.floor((i / verses.length) * 100));
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

  const getBookIdentifier = (el: Element): string => {
    return el.getAttribute('bname')
      || el.getAttribute('name')
      || el.getAttribute('n')
      || el.getAttribute('osisID')
      || el.getAttribute('sID')
      || el.getAttribute('bnumber')
      || el.getAttribute('number')
      || '';
  };

  let currentBookIdx = 0;

  while (currentBookIdx < bookElements.length) {
    const bookEl = bookElements[currentBookIdx];
    const rawBookId = getBookIdentifier(bookEl);
    const rawBookNum = parseInt(bookEl.getAttribute('bnumber') || bookEl.getAttribute('number') || '', 10);

    let chapterElements = Array.from(bookEl.getElementsByTagName('CHAPTER'));
    if (chapterElements.length === 0) chapterElements = Array.from(bookEl.getElementsByTagName('chapter'));
    if (chapterElements.length === 0) chapterElements = Array.from(bookEl.getElementsByTagName('c'));

    for (let c = 0; c < chapterElements.length; c++) {
      const chapEl = chapterElements[c];
      const chapNumAttr = chapEl.getAttribute('cnumber') || chapEl.getAttribute('number') || chapEl.getAttribute('n') || String(c + 1);
      const chapNum = parseInt(chapNumAttr, 10) || (c + 1);

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
    onProgress(Math.floor((currentBookIdx / bookElements.length) * 100));
  }

  return parsedVerses;
}

self.onmessage = (e: MessageEvent<{ type: string; xmlString: string }>) => {
  if (e.data.type === 'parse') {
    try {
      const result = parseBibleXML(e.data.xmlString, (progress) => {
        self.postMessage({ type: 'progress', progress });
      });
      self.postMessage({ type: 'result', verses: result });
    } catch (err: any) {
      self.postMessage({ type: 'error', error: err.message || 'Unknown error parsing XML' });
    }
  }
};
