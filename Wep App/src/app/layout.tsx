import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "AutoCost - تقدير تكاليف إصلاح السيارات",
  description: "نظام احترافي لتقدير تكاليف إصلاح السيارات بدقة عالية",
  keywords: ["AutoCost", "تقدير تكاليف", "إصلاح سيارات", "تقدير أسعار", "تكاليف الصيانة"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body className={`${cairo.variable} antialiased`}>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
