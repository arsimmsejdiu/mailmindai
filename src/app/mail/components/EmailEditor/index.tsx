"use client";

import GhostExtension from "./extension";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Text from "@tiptap/extension-text";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./MenuBar";
import { Button } from "@/components/ui/button";

import { generate } from "./action";
import { readStreamableValue } from "ai/rsc";
import { Separator } from "@/components/ui/separator";
import { useThread } from "../../UseThread";
import useThreads from "../../UseThreads";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import TagInput from "./TagInput";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLocalStorage } from "usehooks-ts";
import { Bot } from "lucide-react";
import AIComposeButton from "./AIComposeButton";

type EmailEditorProps = {
  toValues: { label: string; value: string }[];
  ccValues: { label: string; value: string }[];

  subject: string;
  setSubject: (subject: string) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;

  onToChange: (values: { label: string; value: string }[]) => void;
  onCcChange: (values: { label: string; value: string }[]) => void;

  defaultToolbarExpand?: boolean;
};

const EmailEditor = ({
  toValues,
  ccValues,
  subject,
  setSubject,
  to,
  handleSend,
  isSending,
  onToChange,
  onCcChange,
  defaultToolbarExpand,
}: EmailEditorProps) => {
  const [ref] = useAutoAnimate();
  const [accountId] = useLocalStorage("accountId", "");
  const { data: suggestions } = api.mail.getEmailSuggestions.useQuery(
    { accountId: accountId, query: "" },
    { enabled: !!accountId },
  );

  const [expanded, setExpanded] = useState<boolean | undefined>(
    defaultToolbarExpand ?? false,
  );
  const [generation, setGeneration] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const aiGenerate = async (prompt: string) => {
    const { output } = await generate(prompt);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setGeneration(delta);
      }
    }
  };

  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          aiGenerate(this.editor.getText()).then(() => {});
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, customText, GhostExtension],
    editorProps: {
      attributes: {
        placeholder: "Write your email here...",
      },
    },
    onUpdate: ({ editor, transaction }) => {
      setValue(editor.getHTML());
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        editor &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        editor.commands.focus();
      }
      if (event.key === "Escape" && editor) {
        editor.commands.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  useEffect(() => {
    if (!generation || !editor) return;
    editor.commands.insertContent(generation);
  }, [generation, editor]);

  return (
    <div>
      <div className="flex border-b p-4 py-2">
        {editor && <TipTapMenuBar editor={editor} />}
      </div>

      <div ref={ref} className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              suggestions={suggestions?.map((s) => s.address) || []}
              value={toValues}
              placeholder="Add tags"
              label="To"
              onChange={onToChange}
            />
            <TagInput
              suggestions={suggestions?.map((s) => s.address) || []}
              value={ccValues}
              placeholder="Add tags"
              label="Cc"
              onChange={onCcChange}
            />
            <Input
              id="subject"
              className="w-full"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded((e) => !e)}
          >
            <span className="font-medium text-green-600">Draft </span>
            <span>to {to.join(", ")}</span>
          </div>
          <AIComposeButton
            isComposing={defaultToolbarExpand}
            onGenerate={setGeneration}
          />
        </div>
      </div>

      <div className="prose w-full px-4">
        <EditorContent
          value={value}
          editor={editor}
          placeholder="Write your email here..."
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            handleSend(value);
          }}
          isLoading={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;