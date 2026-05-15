import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

import { getDictionary } from "@/i18n/getDictionary";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { LoadingProvider } from "@/components/ui/LoadingProvider";

import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pawndr | Find your pet's perfect match",
  description: "A premium dating and matching app for pets. Find playdates, mates, or new friends for your furry companions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDictionary();
  return (
    <html lang="en" className="dark">
      <body className={outfit.className}>
        <LanguageProvider dictionary={dict}>
          <Suspense>
            <LoadingProvider>
              {children}
              <Toaster position="top-center" richColors />
            </LoadingProvider>
          </Suspense>
        </LanguageProvider>
      </body>
    </html>
  );
}
