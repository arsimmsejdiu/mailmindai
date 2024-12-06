"use client";
import { KBarPortal, KBarPositioner, KBarAnimator, KBarSearch } from "kbar";
import useAccountSwitching from "@/app/mail/components/kbar/UseAccountSwitching";
import useThemeSwitching from "@/app/mail/components/kbar/UseThemeSwitching";
import { ReactNode } from "react";

export const ActualComponent = ({
  children,
}: {
  children: ReactNode;
}) => {
  useAccountSwitching();
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-white text-foreground shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <div className="bg-white dark:bg-gray-800">
              <div className="border-x-0 border-b-2 dark:border-gray-700">
                <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 dark:bg-gray-800" />
              </div>
              {/*<RenderResults />*/}
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
