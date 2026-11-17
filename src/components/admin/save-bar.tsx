"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, LoaderCircle, RotateCcw, Save } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/** Warns before leaving the page while there are unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/**
 * Editor state with a saved snapshot: tracks unsaved changes, saving, and the last result.
 */
export function useEditorState<T>(initial: T, save: (value: T) => Promise<ActionResult>) {
  const [value, setValue] = React.useState<T>(initial);
  const [saved, setSaved] = React.useState<T>(initial);
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const dirty = React.useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [value, saved]);
  useUnsavedWarning(dirty);

  const submit = () => {
    const snapshot = value;
    setResult(null);
    startTransition(async () => {
      const res = await save(snapshot);
      setResult(res);
      if (res.ok) setSaved(snapshot);
    });
  };

  const discard = () => {
    setValue(saved);
    setResult(null);
  };

  return { value, setValue, dirty, pending, result, submit, discard };
}

interface SaveBarProps {
  dirty: boolean;
  pending: boolean;
  result: ActionResult | null;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ dirty, pending, result, onSave, onDiscard }: SaveBarProps) {
  // Ctrl/Cmd + S saves.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !pending) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, pending, onSave]);

  const visible = dirty || pending || result !== null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          className="glass sticky bottom-4 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 shadow-xl"
        >
          <p className="flex min-w-0 items-center gap-2 text-sm" role="status" aria-live="polite">
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden /> Saving…
              </>
            ) : result && !result.ok ? (
              <span className="flex items-start gap-2 text-destructive">
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {result.error}
              </span>
            ) : dirty ? (
              <>
                <span className="size-2 rounded-full bg-accent" aria-hidden /> You have unsaved changes
              </>
            ) : result?.ok ? (
              <span className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" aria-hidden />
                {result.message ?? "Saved."}
              </span>
            ) : null}
          </p>
          {dirty && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onDiscard} disabled={pending}>
                <RotateCcw /> Discard
              </Button>
              <Button variant="brand" size="sm" onClick={onSave} disabled={pending} aria-busy={pending}>
                <Save /> Save changes
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
