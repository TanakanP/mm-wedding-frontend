import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { WEDDING } from "@/content/wedding";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${WEDDING.couple} Wedding | ${WEDDING.venue.name}`,
  description: `Join us on ${WEDDING.dateLabel} for our celebration at ${WEDDING.venue.name}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
