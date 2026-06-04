export interface BibleBookInfo {
  id: string;
  bookNumber: number;
  english: string;
  tamil: string;
  tamilAbbrev: string;
  category: 'Law' | 'Historical' | 'Poetry' | 'MajorProphets' | 'MinorProphets' | 'Gospels' | 'Acts' | 'Pauline' | 'General' | 'Revelation';
  chaptersCount: number;
}

export const BIBLE_BOOKS_METADATA: BibleBookInfo[] = [
  // Law
  { id: 'GEN', bookNumber: 1, english: 'Genesis', tamil: 'ஆதியாகமம்', tamilAbbrev: 'ஆதி', category: 'Law', chaptersCount: 50 },
  { id: 'EXO', bookNumber: 2, english: 'Exodus', tamil: 'யாத்திராகமம்', tamilAbbrev: 'யாத்', category: 'Law', chaptersCount: 40 },
  { id: 'LEV', bookNumber: 3, english: 'Leviticus', tamil: 'லேவியராகமம்', tamilAbbrev: 'லேவி', category: 'Law', chaptersCount: 27 },
  { id: 'NUM', bookNumber: 4, english: 'Numbers', tamil: 'எண்ணாகமம்', tamilAbbrev: 'எண்', category: 'Law', chaptersCount: 36 },
  { id: 'DEU', bookNumber: 5, english: 'Deuteronomy', tamil: 'உபாகமம்', tamilAbbrev: 'உப', category: 'Law', chaptersCount: 34 },
  
  // Historical
  { id: 'JOS', bookNumber: 6, english: 'Joshua', tamil: 'யோசுவா', tamilAbbrev: 'யோசு', category: 'Historical', chaptersCount: 24 },
  { id: 'JDG', bookNumber: 7, english: 'Judges', tamil: 'நியாயாதிபதிகள்', tamilAbbrev: 'நியா', category: 'Historical', chaptersCount: 21 },
  { id: 'RUT', bookNumber: 8, english: 'Ruth', tamil: 'ரூத்', tamilAbbrev: 'ரூத்', category: 'Historical', chaptersCount: 4 },
  { id: '1SA', bookNumber: 9, english: '1 Samuel', tamil: '1 சாமுவேல்', tamilAbbrev: '1சாமு', category: 'Historical', chaptersCount: 31 },
  { id: '2SA', bookNumber: 10, english: '2 Samuel', tamil: '2 சாமுவேல்', tamilAbbrev: '2சாமு', category: 'Historical', chaptersCount: 24 },
  { id: '1KI', bookNumber: 11, english: '1 Kings', tamil: '1 இராஜாக்கள்', tamilAbbrev: '1இரா', category: 'Historical', chaptersCount: 22 },
  { id: '2KI', bookNumber: 12, english: '2 Kings', tamil: '2 இராஜாக்கள்', tamilAbbrev: '2இரா', category: 'Historical', chaptersCount: 25 },
  { id: '1CH', bookNumber: 13, english: '1 Chronicles', tamil: '1 நாளாகமம்', tamilAbbrev: '1நா', category: 'Historical', chaptersCount: 29 },
  { id: '2CH', bookNumber: 14, english: '2 Chronicles', tamil: '2 நாளாகமம்', tamilAbbrev: '2நா', category: 'Historical', chaptersCount: 36 },
  { id: 'EZR', bookNumber: 15, english: 'Ezra', tamil: 'எஸ்றா', tamilAbbrev: 'எஸ்றா', category: 'Historical', chaptersCount: 10 },
  { id: 'NEH', bookNumber: 16, english: 'Nehemiah', tamil: 'நெகேமியா', tamilAbbrev: 'நெகே', category: 'Historical', chaptersCount: 13 },
  { id: 'EST', bookNumber: 17, english: 'Esther', tamil: 'எஸ்தர்', tamilAbbrev: 'எஸ்தர்', category: 'Historical', chaptersCount: 10 },

  // Poetry & Wisdom
  { id: 'JOB', bookNumber: 18, english: 'Job', tamil: 'யோபு', tamilAbbrev: 'யோபு', category: 'Poetry', chaptersCount: 42 },
  { id: 'PSA', bookNumber: 19, english: 'Psalms', tamil: 'சங்கீதம்', tamilAbbrev: 'சங்', category: 'Poetry', chaptersCount: 150 },
  { id: 'PRO', bookNumber: 20, english: 'Proverbs', tamil: 'நீதிமொழிகள்', tamilAbbrev: 'நீதி', category: 'Poetry', chaptersCount: 31 },
  { id: 'ECC', bookNumber: 21, english: 'Ecclesiastes', tamil: 'பிரசங்கி', tamilAbbrev: 'பிரச', category: 'Poetry', chaptersCount: 12 },
  { id: 'SOS', bookNumber: 22, english: 'Song of Solomon', tamil: 'உன்னதப்பாட்டு', tamilAbbrev: 'உதா', category: 'Poetry', chaptersCount: 8 },

  // Major Prophets
  { id: 'ISA', bookNumber: 23, english: 'Isaiah', tamil: 'ஏசாயா', tamilAbbrev: 'ஏசா', category: 'MajorProphets', chaptersCount: 66 },
  { id: 'JER', bookNumber: 24, english: 'Jeremiah', tamil: 'எரேமியா', tamilAbbrev: 'எரே', category: 'MajorProphets', chaptersCount: 52 },
  { id: 'LAM', bookNumber: 25, english: 'Lamentations', tamil: 'புலம்பல்', tamilAbbrev: 'புலம்', category: 'MajorProphets', chaptersCount: 5 },
  { id: 'EZE', bookNumber: 26, english: 'Ezekiel', tamil: 'எசேக்கியேல்', tamilAbbrev: 'எசே', category: 'MajorProphets', chaptersCount: 48 },
  { id: 'DAN', bookNumber: 27, english: 'Daniel', tamil: 'தானியேல்', tamilAbbrev: 'தானி', category: 'MajorProphets', chaptersCount: 12 },

  // Minor Prophets
  { id: 'HOS', bookNumber: 28, english: 'Hosea', tamil: 'ஓசியா', tamilAbbrev: 'ஓசி', category: 'MinorProphets', chaptersCount: 14 },
  { id: 'JOE', bookNumber: 29, english: 'Joel', tamil: 'யோவேல்', tamilAbbrev: 'யோவே', category: 'MinorProphets', chaptersCount: 3 },
  { id: 'AMO', bookNumber: 30, english: 'Amos', tamil: 'ஆமோஸ்', tamilAbbrev: 'ஆமோ', category: 'MinorProphets', chaptersCount: 9 },
  { id: 'OBA', bookNumber: 31, english: 'Obadiah', tamil: 'ஒபதியா', tamilAbbrev: 'ஒப', category: 'MinorProphets', chaptersCount: 1 },
  { id: 'JON', bookNumber: 32, english: 'Jonah', tamil: 'யோนา', tamilAbbrev: 'யோனா', category: 'MinorProphets', chaptersCount: 4 },
  { id: 'MIC', bookNumber: 33, english: 'Micah', tamil: 'மீகா', tamilAbbrev: 'மீகா', category: 'MinorProphets', chaptersCount: 7 },
  { id: 'NAH', bookNumber: 34, english: 'Nahum', tamil: 'நாகூம்', tamilAbbrev: 'நாகு', category: 'MinorProphets', chaptersCount: 3 },
  { id: 'HAB', bookNumber: 35, english: 'Habakkuk', tamil: 'ஆபகூக்', tamilAbbrev: 'ஆப', category: 'MinorProphets', chaptersCount: 3 },
  { id: 'ZEP', bookNumber: 36, english: 'Zephaniah', tamil: 'செப்பனியா', tamilAbbrev: 'செப்ப', category: 'MinorProphets', chaptersCount: 3 },
  { id: 'HAG', bookNumber: 37, english: 'Haggai', tamil: 'ஆகாய்', tamilAbbrev: 'ஆகாய்', category: 'MinorProphets', chaptersCount: 2 },
  { id: 'ZEC', bookNumber: 38, english: 'Zechariah', tamil: 'சகரியா', tamilAbbrev: 'சக', category: 'MinorProphets', chaptersCount: 14 },
  { id: 'MAL', bookNumber: 39, english: 'Malachi', tamil: 'மல்கியா', tamilAbbrev: 'மல்', category: 'MinorProphets', chaptersCount: 4 },

  // Gospels
  { id: 'MAT', bookNumber: 40, english: 'Matthew', tamil: 'மத்தேயு', tamilAbbrev: 'மத்', category: 'Gospels', chaptersCount: 28 },
  { id: 'MRK', bookNumber: 41, english: 'Mark', tamil: 'மாற்கு', tamilAbbrev: 'மாற்', category: 'Gospels', chaptersCount: 16 },
  { id: 'LUK', bookNumber: 42, english: 'Luke', tamil: 'லூக்கா', tamilAbbrev: 'லூக்', category: 'Gospels', chaptersCount: 24 },
  { id: 'JHN', bookNumber: 43, english: 'John', tamil: 'யோவான்', tamilAbbrev: 'யோவா', category: 'Gospels', chaptersCount: 21 },

  // Acts
  { id: 'ACT', bookNumber: 44, english: 'Acts', tamil: 'அப்போஸ்தலர்', tamilAbbrev: 'அப்', category: 'Acts', chaptersCount: 28 },

  // Pauline Epistles
  { id: 'ROM', bookNumber: 45, english: 'Romans', tamil: 'ரோமர்', tamilAbbrev: 'ரோம', category: 'Pauline', chaptersCount: 16 },
  { id: '1CO', bookNumber: 46, english: '1 Cor', tamil: '1 கொரிந்தியர்', tamilAbbrev: '1கொரி', category: 'Pauline', chaptersCount: 16 },
  { id: '2CO', bookNumber: 47, english: '2 Cor', tamil: '2 கொரிந்தியர்', tamilAbbrev: '2கொரி', category: 'Pauline', chaptersCount: 13 },
  { id: 'GAL', bookNumber: 48, english: 'Galatians', tamil: 'கலாத்தியர்', tamilAbbrev: 'கலா', category: 'Pauline', chaptersCount: 6 },
  { id: 'EPH', bookNumber: 49, english: 'Ephesians', tamil: 'எபேசியர்', tamilAbbrev: 'எபே', category: 'Pauline', chaptersCount: 6 },
  { id: 'PHP', bookNumber: 50, english: 'Philippians', tamil: 'பிலிப்பியர்', tamilAbbrev: 'பிலி', category: 'Pauline', chaptersCount: 4 },
  { id: 'COL', bookNumber: 51, english: 'Colossians', tamil: 'கொலோசெயர்', tamilAbbrev: 'கொலோ', category: 'Pauline', chaptersCount: 4 },
  { id: '1TH', bookNumber: 52, english: '1 Thess', tamil: '1 தெசலோனிக்கேயர்', tamilAbbrev: '1தெச', category: 'Pauline', chaptersCount: 5 },
  { id: '2TH', bookNumber: 53, english: '2 Thess', tamil: '2 தெசலோனிக்கேயர்', tamilAbbrev: '2தெச', category: 'Pauline', chaptersCount: 4 },
  { id: '1TI', bookNumber: 54, english: '1 TImothy', tamil: '1 தீமோத்தேயு', tamilAbbrev: '1தீமோ', category: 'Pauline', chaptersCount: 6 },
  { id: '2TI', bookNumber: 55, english: '2 Timothy', tamil: '2 தீமோத்தேயு', tamilAbbrev: '2தீமோ', category: 'Pauline', chaptersCount: 4 },
  { id: 'TIT', bookNumber: 56, english: 'Titus', tamil: 'தீத்து', tamilAbbrev: 'தீத்து', category: 'Pauline', chaptersCount: 3 },
  { id: 'PHM', bookNumber: 57, english: 'Philemon', tamil: 'பிலேமோன்', tamilAbbrev: 'பிலே', category: 'Pauline', chaptersCount: 1 },

  // General Epistles
  { id: 'HEB', bookNumber: 58, english: 'Hebrews', tamil: 'எபிரெயர்', tamilAbbrev: 'எபி', category: 'General', chaptersCount: 13 },
  { id: 'JAS', bookNumber: 59, english: 'James', tamil: 'யாக்கோபு', tamilAbbrev: 'யாக்', category: 'General', chaptersCount: 5 },
  { id: '1PE', bookNumber: 60, english: '1 Peter', tamil: '1 பேதுரு', tamilAbbrev: '1பேது', category: 'General', chaptersCount: 5 },
  { id: '2PE', bookNumber: 61, english: '2 Peter', tamil: '2 பேதுரு', tamilAbbrev: '2பேது', category: 'General', chaptersCount: 3 },
  { id: '1JO', bookNumber: 62, english: '1 John', tamil: '1 யோவான்', tamilAbbrev: '1யோவா', category: 'General', chaptersCount: 5 },
  { id: '2JO', bookNumber: 63, english: '2 John', tamil: '2 யோவான்', tamilAbbrev: '2யோவா', category: 'General', chaptersCount: 1 },
  { id: '3JO', bookNumber: 64, english: '3 John', tamil: '3 யோவான்', tamilAbbrev: '3யோவா', category: 'General', chaptersCount: 1 },
  { id: 'JUD', bookNumber: 65, english: 'Jude', tamil: 'யூதா', tamilAbbrev: 'யூதா', category: 'General', chaptersCount: 1 },
  { id: 'REV', bookNumber: 66, english: 'Revelation', tamil: 'வெளிப்படுத்தின விசேஷம்', tamilAbbrev: 'வெளி', category: 'Revelation', chaptersCount: 22 }
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

  const cleanStr = (s: string) => s.replace(/[\s\-_\.]/g, '').toLowerCase();
  const cleanedName = cleanStr(name);

  // 0. Try numeric book number
  const bookNum = parseInt(cleanedName, 10);
  if (!isNaN(bookNum) && bookNum >= 1 && bookNum <= 66) {
    const match = BIBLE_BOOKS_METADATA.find(b => b.bookNumber === bookNum);
    if (match) return match;
  }

  // 1. Direct match on ID
  let match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.id) === cleanedName);
  if (match) return match;

  // 2. Exact alias match
  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    if (aliases.some(alias => cleanStr(alias) === cleanedName)) {
      const found = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
      if (found) return found;
    }
  }

  // 3. Exact English name
  match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.english) === cleanedName);
  if (match) return match;

  // 4. Exact Tamil name/abbreviation
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.tamil) === cleanedName || cleanStr(b.tamilAbbrev) === cleanedName
  );
  if (match) return match;

  // 5. Starts-with English
  match = BIBLE_BOOKS_METADATA.find(b => cleanStr(b.english).startsWith(cleanedName));
  if (match) return match;

  // 6. Starts-with Tamil
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.tamil).startsWith(cleanedName) || cleanStr(b.tamilAbbrev).startsWith(cleanedName)
  );
  if (match) return match;

  // 7. Starts-with alias
  for (const [bookId, aliases] of Object.entries(BIBLE_BOOK_ALIASES)) {
    if (aliases.some(alias => cleanStr(alias).startsWith(cleanedName))) {
      const found = BIBLE_BOOKS_METADATA.find(b => b.id === bookId);
      if (found) return found;
    }
  }

  // 8. Containment match
  match = BIBLE_BOOKS_METADATA.find(
    b => cleanStr(b.english).includes(cleanedName) || cleanedName.includes(cleanStr(b.english))
  );
  if (match) return match;

  // 9. Levenshtein fallback
  const levenshtein = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        matrix[i][j] = Math.min(matrix[i-1][j]+1, matrix[i][j-1]+1, matrix[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return matrix[a.length][b.length];
  };

  if (cleanedName.length >= 3) {
    let bestMatch: BibleBookInfo | undefined;
    let minDist = Infinity;
    for (const book of BIBLE_BOOKS_METADATA) {
      const dist = levenshtein(cleanedName, cleanStr(book.english));
      const allowed = cleanedName.length <= 4 ? 1 : 2;
      if (dist <= allowed && dist < minDist) { minDist = dist; bestMatch = book; }
    }
    if (bestMatch) return bestMatch;
  }

  return undefined;
}
