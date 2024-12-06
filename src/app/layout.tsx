import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import {ThemeProvider} from "@/components/provider/ThemeProvider";
import {ClerkProvider} from "@clerk/nextjs";
import React from "react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MailMind AI - The Future of Automated Email Communication",
  description: "MailMind AI automates email communication with smart composition, scheduling, and personalized responses, enhancing efficiency and accuracy.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
      <body>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <TRPCReactProvider>
          {/*<Kbar>*/}
            {children}
          {/*</Kbar>*/}
        </TRPCReactProvider>
        <Toaster />
      </ThemeProvider>
      </body>
      </html>
    </ClerkProvider>
  );
}
