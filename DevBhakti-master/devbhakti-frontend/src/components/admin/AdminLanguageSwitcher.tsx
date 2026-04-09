"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage, type Language } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const langFullNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  mr: "मराठी (Marathi)",
};

const langLabels: Record<Language, string> = {
  en: "EN",
  hi: "HI",
  mr: "MR",
};

export function AdminLanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 gap-2 text-muted-foreground hover:text-foreground border border-border/50 bg-background/50 backdrop-blur-sm rounded-lg"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-bold">{langLabels[language]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mt-2 shadow-lg border-border">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/70 px-3 py-2">
          {t('navbar.language') || "Select Language"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["en", "hi", "mr"] as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`
              flex items-center justify-between cursor-pointer mx-1 my-1 rounded-md px-3 py-2
              ${language === lang ? "bg-primary/5 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            <span>{langFullNames[lang]}</span>
            {language === lang && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
