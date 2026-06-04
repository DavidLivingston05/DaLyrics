export interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  bookNumber?: number;
}

export function parseBibleXMLFast(xmlString: string, onProgress: (progress: number) => void): ParsedVerse[] {
  const result: ParsedVerse[] = [];

  let total = 0;
  const tagCount = xmlString.match(/<\/(?:VERS|verse|v)\s*>/gi);
  if (tagCount) total = tagCount.length;

  const tryFlatVerses = () => {
    const verseRegex = /<(verse|VERS|v)\s+([^>]+?)>([\s\S]*?)<\/\1\s*>/gi;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = verseRegex.exec(xmlString)) !== null) {
      const attrs = match[2];
      const text = match[3].trim();
      if (!text) continue;

      const book = extractAttr(attrs, 'book', 'bk', 'b', 'osisID') || 'GEN';
      const chapter = parseInt(extractAttr(attrs, 'chapter', 'ch', 'c') || '1', 10);
      const verse = parseInt(extractAttr(attrs, 'verse', 'num', 'vnumber', 'v') || '1', 10);
      result.push({ book, chapter, verse, text });

      idx++;
      if (idx % 500 === 0) onProgress(Math.floor((idx / total) * 100));
    }
    return result.length > 0;
  };

  const tryHierarchical = () => {
    const bookRegex = /<(BIBLEBOOK|biblebook|book|Book)\s+([^>]+?)>([\s\S]*?)<\/\1\s*>/gi;
    let bookMatch: RegExpExecArray | null;
    let bookIdx = 0;
    let bookCount = 0;
    const bookMatches: RegExpExecArray[] = [];
    while ((bookMatch = bookRegex.exec(xmlString)) !== null) {
      bookMatches.push(bookMatch);
    }
    bookCount = bookMatches.length;

    for (const bm of bookMatches) {
      const bookAttrs = bm[2];
      const bookContent = bm[3];
      const rawBookId = extractAttr(bookAttrs, 'bname', 'name', 'n', 'osisID', 'sID', 'bnumber', 'number') || '';
      const rawBookNum = parseInt(extractAttr(bookAttrs, 'bnumber', 'number') || '', 10);

      const chapterRegex = /<(CHAPTER|chapter|c)\s+([^>]+?)>([\s\S]*?)<\/\1\s*>/gi;
      let chapMatch: RegExpExecArray | null;
      while ((chapMatch = chapterRegex.exec(bookContent)) !== null) {
        const chapAttrs = chapMatch[2];
        const chapContent = chapMatch[3];
        const chapNum = parseInt(extractAttr(chapAttrs, 'cnumber', 'number', 'n') || '1', 10);

        const verseRegex = /<(VERS|verse|v)\s+([^>]+?)>([\s\S]*?)<\/\1\s*>/gi;
        let vMatch: RegExpExecArray | null;
        while ((vMatch = verseRegex.exec(chapContent)) !== null) {
          const vAttrs = vMatch[2];
          const text = vMatch[3].trim();
          if (!text) continue;
          const verseNum = parseInt(extractAttr(vAttrs, 'vnumber', 'number', 'v', 'n') || '1', 10);
          result.push({
            book: rawBookId,
            chapter: chapNum,
            verse: verseNum,
            text,
            bookNumber: !isNaN(rawBookNum) ? rawBookNum : undefined,
          });
        }
      }

      bookIdx++;
      onProgress(Math.floor((bookIdx / bookCount) * 100));
    }
    return result.length > 0;
  };

  const tryFlatVersesNoAttrs = () => {
    const flatRegex = /<(verse|VERS|v)\b[^>]*?>([\s\S]*?)<\/\1\s*>/gi;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = flatRegex.exec(xmlString)) !== null) {
      const fullTag = match[0];
      const text = match[2].trim();
      if (!text) continue;

      const book = extractAttrFromFull(fullTag, 'book', 'bk', 'b', 'osisID') || 'GEN';
      const chapter = parseInt(extractAttrFromFull(fullTag, 'chapter', 'ch', 'c') || '1', 10);
      const verse = parseInt(extractAttrFromFull(fullTag, 'verse', 'num', 'vnumber', 'v') || '1', 10);
      result.push({ book, chapter, verse, text });

      idx++;
      if (idx % 500 === 0) onProgress(Math.floor((idx / total) * 100));
    }
    return result.length > 0;
  };

  if (tryHierarchical()) return result;
  if (tryFlatVerses()) return result;
  if (tryFlatVersesNoAttrs()) return result;
  return result;
}

function extractAttr(attrsStr: string, ...names: string[]): string | undefined {
  for (const name of names) {
    const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
    const m = regex.exec(attrsStr);
    if (m) return m[1];
  }
  return undefined;
}

function extractAttrFromFull(tag: string, ...names: string[]): string | undefined {
  for (const name of names) {
    const regex = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i');
    const m = regex.exec(tag);
    if (m) return m[1];
  }
  return undefined;
}
