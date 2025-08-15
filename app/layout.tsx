import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Navigation from "@/components/navigation";
import { ToastProvider } from "@/components/toast-provider";
import { I18nextProvider } from "@/components/i18next-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlanYMeal",
  description: "Plan your meals, organize your week, and generate shopping lists effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <I18nextProvider>
            <ToastProvider>
              <Navigation />
              {children}
            </ToastProvider>
          </I18nextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
