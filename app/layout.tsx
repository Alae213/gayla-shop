import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gayla - Shop",
  description: "E-commerce platform for Gayla products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ FIXED: Root layout should NOT have <html> or <body> when using [locale]
  return children;
}
