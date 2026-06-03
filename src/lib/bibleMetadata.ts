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
