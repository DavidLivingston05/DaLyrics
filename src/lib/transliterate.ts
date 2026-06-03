const VOWELS: Record<string, string> = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
  'ஃ': 'h',
};

const VOWEL_SIGNS: Record<string, string> = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
  'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oo', 'ௌ': 'au',
};

const CONSONANTS: Record<string, string> = {
  'க': 'k', 'ங': 'ng', 'ச': 'ch', 'ஜ': 'j', 'ஞ': 'gn',
  'ட': 'd', 'ண': 'n', 'த': 'th', 'ந': 'n', 'ன': 'n',
  'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r', 'ல': 'l',
  'வ': 'v', 'ழ': 'zh', 'ள': 'l', 'ற': 'r', 'ஶ': 'sh',
  'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h', 'க்ஷ': 'ksh',
};

const PULLI = '்';

export function transliterateToEnglish(text: string): string {
  const chars = [...text.normalize('NFC')];
  const out: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch in VOWELS) {
      out.push(VOWELS[ch]);
      continue;
    }

    if (ch in CONSONANTS) {
      const base = CONSONANTS[ch];
      const next = i + 1 < chars.length ? chars[i + 1] : '';

      if (next in VOWEL_SIGNS) {
        out.push(base + VOWEL_SIGNS[next]);
        i++;
      } else if (next === PULLI) {
        out.push(base);
        i++;
      } else {
        out.push(base + 'a');
      }
      continue;
    }

    if (ch === PULLI) {
      const last = out.pop() || '';
      out.push(last.replace(/a$/, ''));
      continue;
    }

    out.push(ch);
  }

  return out.join('');
}
