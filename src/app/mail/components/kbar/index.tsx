"use client";
import { type Action, KBarProvider, Priority } from "kbar";
import { ActualComponent } from "./ActualComponent";
import { useLocalStorage } from "usehooks-ts";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../SearchBar";
import { useThread } from "../../UseThread";
import { ReactNode } from "react";

export default function KBar({ children }: { children: ReactNode }) {
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);
  const [_, setTab] = useLocalStorage("normalhuman-tab", "inbox");
  const [threadId, setThreadId] = useThread();
  const [done, setDone] = useLocalStorage("normalhuman-done", false);

  const actions: Action[] = [
    {
      id: "inboxAction",
      name: "Inbox",
      shortcut: ["g", "i"],
      keywords: "inbox",
      section: "Navigation",
      subtitle: "View your inbox",
      perform: () => {
        setTab("inbox");
      },
    },
    {
      id: "draftsAction",
      name: "Drafts",
      shortcut: ["g", "d"],
      keywords: "drafts",
      priority: Priority.HIGH,
      subtitle: "View your drafts",
      section: "Navigation",
      perform: () => {
        setTab("drafts");
      },
    },
    {
      id: "sentAction",
      name: "Sent",
      shortcut: ["g", "s"],
      keywords: "sent",
      section: "Navigation",
      subtitle: "View the sent",
      perform: () => {
        setTab("sent");
      },
    },
    {
      id: "pendingAction",
      name: "See done",
      shortcut: ["g", "d"],
      keywords: "done",
      section: "Navigation",
      subtitle: "View the done emails",
      perform: () => {
        setDone(true);
      },
    },
    {
      id: "doneAction",
      name: "See Pending",
      shortcut: ["g", "u"],
      keywords: "pending, undone, not done",
      section: "Navigation",
      subtitle: "View the pending emails",
      perform: () => {
        setDone(false);
      },
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <ActualComponent>{children}</ActualComponent>
    </KBarProvider>
  );
}
