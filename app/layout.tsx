import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orchestra Export — Pilotage International",
  description: "Outil de gestion du développement export Orchestra",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
