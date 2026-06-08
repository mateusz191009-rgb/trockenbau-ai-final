"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Wraps the app with class-based dark mode support.
 * `attribute="class"` toggles the `.dark` class on <html>, which Tailwind reads.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
