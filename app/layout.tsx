import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/providers/session-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resto-Admin",
  description: "Restaurant Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToasterProvider />
          <ModalProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
