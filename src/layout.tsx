import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import DockWrapper from "@/components/layout/DockWrapper";
import localFont from "next/font/local";

const notoSans = localFont({
  src: "../../public/fonts/noto-sans-v39-latin-regular.woff2",
});

const openSans = localFont({
  src: "../../public/fonts/open-sans-v43-latin-regular.woff2",
});

export const metadata: Metadata = {
  title: "Nain | Helping you to manage your child's development",
  description: "Helping you to manage your child's development",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="evilwizard" suppressHydrationWarning={true}>
      <body
        className={`${openSans.className} ${notoSans.className} antialiased`}
      >
        <DockWrapper />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
