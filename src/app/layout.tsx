import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

import {ClerkProvider} from "@clerk/nextjs";
import React from "react";

export const metadata: Metadata = {
  title: "MailMind AI - The Future of Automated Email Communication",
  description: "MailMind AI automates email communication with smart composition, scheduling, and personalized responses, enhancing efficiency and accuracy.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
      </html>
    </ClerkProvider>
  );
}
