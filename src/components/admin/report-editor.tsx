"use client";

import { saveDataSection } from "@/app/admin/actions";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { SystemsReport } from "@/types";
import { SaveBar, useEditorState } from "./save-bar";

/** Editor for the systems evaluation report shown under the comparison. */
export function ReportEditor({ initial }: { initial: SystemsReport }) {
  const editor = useEditorState(initial, (value) => saveDataSection("systemsReport", value));
  const { value, setValue } = editor;
  const set = (key: keyof SystemsReport, v: string) => setValue((r) => ({ ...r, [key]: v }));

  return (
    <section className="glass mt-10 rounded-3xl p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Evaluation report</h2>
      <p className="mt-1 text-sm text-muted-foreground">Methodology and findings, shown below the systems on the public page.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rep-titleEn">Title (English)</Label>
          <Input id="rep-titleEn" value={value.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rep-titleAr">Title (Arabic)</Label>
          <Input id="rep-titleAr" dir="rtl" lang="ar" value={value.titleAr} onChange={(e) => set("titleAr", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rep-summaryEn">Summary (English)</Label>
          <Textarea id="rep-summaryEn" value={value.summaryEn} onChange={(e) => set("summaryEn", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rep-summaryAr">Summary (Arabic)</Label>
          <Textarea id="rep-summaryAr" dir="rtl" lang="ar" value={value.summaryAr} onChange={(e) => set("summaryAr", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="rep-body">Report text (Arabic)</Label>
          <Textarea id="rep-body" dir="rtl" lang="ar" className="min-h-80 font-mono text-[13px]" value={value.bodyAr} onChange={(e) => set("bodyAr", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rep-date">Date</Label>
          <Input id="rep-date" dir="ltr" value={value.date} onChange={(e) => set("date", e.target.value)} />
        </div>
      </div>
      <SaveBar dirty={editor.dirty} pending={editor.pending} result={editor.result} onSave={editor.submit} onDiscard={editor.discard} />
    </section>
  );
}
