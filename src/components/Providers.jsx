import { ThemeProvider } from "next-themes";
import { DialogProvider } from "@/components/globals/DialogProvider";
import { LanguageProvider } from "@/components/globals/LanguageProvider";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <LanguageProvider>
        <DialogProvider>{children}</DialogProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
