"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, X } from "lucide-react";

export interface PdfDoc {
  title: string;
  src: string;
}

/** Full-screen PDF viewer (the browser's built-in viewer in a frame). */
export function PdfModal({
  doc,
  onClose,
  labels,
}: {
  doc: PdfDoc | null;
  onClose: () => void;
  labels: { close: string; download: string; open: string };
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!doc) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [doc, onClose]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={doc.title}
          className="fixed inset-0 z-[150] flex flex-col bg-black/85 p-3 backdrop-blur-xl sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="mb-3 flex items-center justify-between gap-3 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="min-w-0 truncate text-sm font-medium sm:text-base">{doc.title}</p>
            <div className="flex shrink-0 gap-2">
              <a href={doc.src} download className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label={labels.download} title={labels.download}>
                <Download className="size-4" />
              </a>
              <a href={doc.src} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label={labels.open} title={labels.open}>
                <ExternalLink className="size-4" />
              </a>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} className="grid size-10 place-items-center rounded-full bg-white/10 transition-transform hover:rotate-90 hover:bg-white/20">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <motion.iframe
            key={doc.src}
            src={`${doc.src}#view=FitH`}
            title={doc.title}
            className="min-h-0 w-full flex-1 rounded-2xl bg-white"
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
