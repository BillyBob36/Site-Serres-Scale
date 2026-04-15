"use client";

import { I18nProvider } from "../lib/i18n/i18nContext";
import { ReactNode } from "react";

export default function I18nWrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
