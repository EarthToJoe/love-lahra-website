import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitalsProvider } from "@/components/providers/web-vitals-provider";
import { NotificationToast } from "@/components/ui/notification-toast";
import { SkipLinks } from "@/components/ui/skip-link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
});

export const metadata: Metadata = {
  title: "Hey, it's Lahra 💁‍♀️ | Sophisticated Lifestyle & Elevated Experiences",
  description: "Welcome to a world of sophisticated style, elevated experiences, and unapologetic confidence. From New York boardrooms to coastal dining, discover the lifestyle that defines modern elegance.",
  keywords: ["lifestyle", "fashion", "dining", "sophistication", "New York", "elegance", "luxury"],
  authors: [{ name: "Lahra" }],
  creator: "Lahra",
  manifest: "/manifest.json",
  openGraph: {
    title: "Hey, it's Lahra 💁‍♀️",
    description: "Sophisticated lifestyle, elevated experiences, and unapologetic confidence.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hey, it's Lahra 💁‍♀️",
    description: "Sophisticated lifestyle, elevated experiences, and unapologetic confidence.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lahra's Life",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Lahra's Life",
    "application-name": "Lahra's Life",
    "msapplication-TileColor": "#4f46e5",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#4f46e5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfairDisplay.variable} ${dancingScript.variable} antialiased`}>
        <SkipLinks />
        <WebVitalsProvider>
          <ThemeProvider>
            <AuthSessionProvider>
              {children}
              <NotificationToast />
            </AuthSessionProvider>
          </ThemeProvider>
        </WebVitalsProvider>
      </body>
    </html>
  );
}
