"use client"

import React, { useEffect, useState } from "react";
import Mail from "@/app/mail/components/mail";
import { fetchCookies } from "./FetchCookies";
import Image from "next/image";

function MailPage() {
  const [cookieData, setCookieData] = useState({ defaultLayout: undefined, defaultCollapsed: undefined });

  useEffect(() => {
    fetchCookies().then(data => setCookieData(data));
  }, []);

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="flex-col hidden md:flex h-screen overflow-scroll">
        <Mail
          defaultLayout={cookieData.defaultLayout}
          defaultCollapsed={cookieData.defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}

export default MailPage;