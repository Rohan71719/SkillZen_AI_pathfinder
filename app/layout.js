import { Inter} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header  from "@/components/header.jsx";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";


const inter = Inter({subsets: ["latin"] });


export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            {/*footer*/}
         <footer className="bg-muted/50 py-12">
  <div className="max-w-md mx-auto px-4 text-center">
    <p className="text-gray-200 text-lg font-semibold tracking-wide 
                  animate-pulse hover:scale-105 transition-transform duration-300">
      Made by <span className="font-bold">Rohan</span>. Powered by You.
    </p>
  </div>
</footer>

            
          </ThemeProvider>
      </body>
    </html>

      </ClerkProvider>
  );
}
