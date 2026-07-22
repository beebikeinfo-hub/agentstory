import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeeBike Story Agent",
  description: "Generiši BeeBike Instagram story-je",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body style={{ margin: 0, padding: 0, background: "#060606" }}>{children}</body>
    </html>
  );
}
