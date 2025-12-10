import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Plus_Jakarta_Sans, Roboto } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Toolify - AI Tool Recognition",
  description: "Identify any tool instantly with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${roboto.variable} ${plusJakartaSans.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
