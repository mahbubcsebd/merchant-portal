
import { ThemeProvider } from "next-themes"
import { DialogProvider } from "@/components/globals/DialogProvider"

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <DialogProvider>
        {children}
      </DialogProvider>
    </ThemeProvider>
  )
}
