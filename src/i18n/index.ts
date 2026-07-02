import { createContext, useContext } from "react";
import type { Lang, LocalizedText } from "../types";
import { en } from "./en";
import { de } from "./de";

const DICTS: Record<Lang, Record<string, string>> = { en, de };

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Translation with real plural rules. If `vars.count` is a number, the key is
 * resolved as `${key}.${category}` using Intl.PluralRules for the language
 * (with `.other` as fallback), so languages with richer plural systems only
 * need more dictionary entries — no code changes.
 */
export function makeT(lang: Lang): TFunc {
  const dict = DICTS[lang] ?? en;
  const locale = dict["locale"] ?? "en-US";
  const plural = new Intl.PluralRules(locale);

  return (key, vars) => {
    let resolved = key;
    if (vars && typeof vars["count"] === "number") {
      const cat = `${key}.${plural.select(vars["count"] as number)}`;
      if (dict[cat] !== undefined || en[cat] !== undefined) resolved = cat;
      else if (dict[`${key}.other`] !== undefined || en[`${key}.other`] !== undefined) {
        resolved = `${key}.other`;
      }
    }
    let str = dict[resolved] ?? en[resolved] ?? key;
    if (vars) {
      for (const [name, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${name}}`, String(v));
      }
    }
    return str;
  };
}

/** Resolve translatable content embedded in data files. */
export function localize(text: LocalizedText | undefined, lang: Lang): string {
  if (!text) return "";
  return (lang === "de" && text.de) || text.en;
}

export function localeOf(lang: Lang): string {
  return DICTS[lang]?.["locale"] ?? "en-US";
}

export interface LangValue {
  lang: Lang;
  t: TFunc;
}

export const LangContext = createContext<LangValue>({ lang: "en", t: makeT("en") });

export function useLang(): LangValue {
  return useContext(LangContext);
}

export function useT(): TFunc {
  return useContext(LangContext).t;
}
