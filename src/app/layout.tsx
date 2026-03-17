import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meme Generator",
  description: "Create and customize memes with ease",
  openGraph: {
    title: "Meme Generator",
    description: "Create and customize memes with ease",
    images: [{ url: "/og-memegen.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meme Generator",
    description: "Create and customize memes with ease",
    images: ["/og-memegen.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased`}
      >
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
