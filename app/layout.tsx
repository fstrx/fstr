import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { DEFAULT_THEME, themeScript } from "@/lib/theme";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const title = `${site.name.toLowerCase()} — ${site.alias}`;

export const metadata: Metadata = {
  // only set when NEXT_PUBLIC_SITE_URL is provided; no domain is hardcoded
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: { default: title, template: `%s — ${site.alias}` },
  description: site.description,
  applicationName: site.alias,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    "Varad Sharma",
    "fstr",
    "developer",
    "systems engineering",
    "systems programming",
    "operating systems",
    "artificial intelligence",
    "security",
    "Aedura",
    "Bhopal",
  ],
  alternates: site.url ? { canonical: "/" } : undefined,
  openGraph: {
    type: "profile",
    title,
    description: site.description,
    siteName: site.alias,
    locale: "en_IN",
    firstName: "Varad",
    lastName: "Sharma",
    username: site.alias,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    creator: "@fstrxrr",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0b0a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${geist.variable} ${jetbrains.variable} ${instrument.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-fg focus:px-3 focus:py-2 focus:text-bg text-xs"
        >
          skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
