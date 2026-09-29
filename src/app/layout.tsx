import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_Thai, Playfair_Display } from "next/font/google";
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

const guestLatin = Cormorant_Garamond({
  variable: "--font-guest-latin",
  subsets: ["latin"],
  weight: "500",
  style: "italic",
});

const guestThai = Noto_Serif_Thai({
  variable: "--font-guest-thai",
  subsets: ["thai"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mimeen Wedding",
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
      className={`${inter.variable} ${playfair.variable} ${guestLatin.variable} ${guestThai.variable} antialiased bg-background text-foreground`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
