"use client";

import { useEffect } from "react";
import { useProgress } from "@/components/useProgress";
import { readSettings } from "@/lib/engine/settings";
import { isRtl, type Lang } from "@/lib/i18n/lang";
import { copy, type Copy } from "@/lib/i18n/ui";

/**
 * The chosen language, the words that go with it, and the page direction.
 *
 * The direction is set on the document rather than rendered into the markup:
 * the language lives in localStorage, so the server has no idea which way the
 * page reads until the client has looked.
 */
export function useLang(): { lang: Lang; t: Copy; rtl: boolean } {
  const { progress } = useProgress();
  const lang = readSettings(progress.settings).lang;
  const rtl = isRtl(lang);

  useEffect(() => {
    document.documentElement.lang = lang === "he" ? "he" : "en";
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  return { lang, t: copy(lang), rtl };
}
