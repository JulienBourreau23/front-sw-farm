import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LangState {
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "fr",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "sw-farm-lang",
    },
  ),
);
