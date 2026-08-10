import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accordiq.app"),
  title: {
    default: "AccordIQ",
    template: "%s | AccordIQ",
  },
  description:
    "AI-powered document intelligence platform for OCR, intelligent extraction, validation, and document understanding.",
  applicationName: "AccordIQ",
  keywords: [
    "AccordIQ",
    "OCR",
    "Artificial Intelligence",
    "Document Intelligence",
    "Spring Boot",
    "Next.js",
    "Tesseract",
    "Invoice OCR",
    "Receipt OCR",
  ],
  authors: [
    {
      name: "Sumit Dhara",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}