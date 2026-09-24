const ENDPOINT = "https://api.mymemory.translated.net/get";
const FALLBACK_TIMEOUT = 4500;

const LANG_LABELS = {
  fr: "French", es: "Spanish", de: "German", it: "Italian",
  pt: "Portuguese", ja: "Japanese", zh: "Chinese", ko: "Korean",
  ru: "Russian", ar: "Arabic", hi: "Hindi", nl: "Dutch",
  sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish",
  pl: "Polish", tr: "Turkish", el: "Greek", he: "Hebrew",
  cs: "Czech", hu: "Hungarian", ro: "Romanian", uk: "Ukrainian",
  th: "Thai", vi: "Vietnamese", id: "Indonesian", ms: "Malay",
};

const SCRIPT_LANGS = [
  { regex: /[\u3040-\u30ff\u31f0-\u31ff]/, lang: "ja" },
  { regex: /[\uac00-\ud7af]/, lang: "ko" },
  { regex: /[\u4e00-\u9fff]/, lang: "zh" },
  { regex: /[\u0400-\u04ff]/, lang: "ru" },
  { regex: /[\u0600-\u06ff\u0750-\u077f]/, lang: "ar" },
  { regex: /[\u0900-\u097f]/, lang: "hi" },
  { regex: /[\u0590-\u05ff]/, lang: "he" },
  { regex: /[\u0370-\u03ff]/, lang: "el" },
  { regex: /[\u0e00-\u0e7f]/, lang: "th" },
  { regex: /[\u00c0-\u00ff\u0100-\u017f]/, lang: "fr" },
];

const ROMANCE_CANDIDATES = ["fr", "es", "it", "pt", "de"];

function guessLangByScript(text) {
  for (const { regex, lang } of SCRIPT_LANGS) {
    if (regex.test(text)) return lang;
  }
  return null;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function tryTranslate(text, lang) {
  try {
    const res = await withTimeout(
      fetch(`${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${lang}|en`),
      FALLBACK_TIMEOUT
    );
    const data = await res.json();
    if (data?.responseStatus !== 200) return null;
    return data?.responseData?.translatedText || null;
  } catch {
    return null;
  }
}

export async function translateToEnglish(text) {
  if (!text || !text.trim()) {
    return { original: text, translated: text, sourceLang: "en", wasTranslated: false };
  }

  const scriptLang = guessLangByScript(text);
  const candidates = scriptLang ? [scriptLang] : ROMANCE_CANDIDATES;

  const results = await Promise.all(
    candidates.map(async (lang) => ({
      lang,
      translated: await tryTranslate(text, lang),
    }))
  );

  for (const r of results) {
    if (
      r.translated &&
      r.translated.trim().toLowerCase() !== text.trim().toLowerCase()
    ) {
      return {
        original: text,
        translated: r.translated,
        sourceLang: r.lang,
        wasTranslated: true,
      };
    }
  }

  return { original: text, translated: text, sourceLang: "en", wasTranslated: false };
}

export function getLangLabel(code) {
  if (!code || code === "auto") return "non-English";
  return LANG_LABELS[code] || code.toUpperCase();
}
