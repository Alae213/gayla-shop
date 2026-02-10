import { Inter, Cairo } from "next/font/google";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const bodyFontClassName = `${inter.variable} ${cairo.variable} font-sans`;
