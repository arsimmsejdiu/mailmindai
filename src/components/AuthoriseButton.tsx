"use client";

import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

export default function AuthoriseButton() {
  return (
    <Button
      size="sm"
      variant={"outline"}
      onClick={async () => {
        window.location.href = await getAurinkoAuthUrl("Google");
      }}
    >
      Authorize Email
    </Button>
  );
}
