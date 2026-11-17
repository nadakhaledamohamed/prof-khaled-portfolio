"use client";

import { saveDataSection } from "@/app/admin/actions";
import { Input, Label } from "@/components/ui/field";
import type { MetricId, SiteData } from "@/types";
import { SaveBar, useEditorState } from "./save-bar";
import { UploadField } from "./upload-field";

type ProfileData = Pick<SiteData, "links" | "verifiedDomain" | "metrics">;

const metricLabels: Record<MetricId, string> = {
  citations: "Total citations",
  "h-index": "h-index",
  "i10-index": "i10-index",
  years: "Years active",
};

export function ProfileEditor({ initial }: { initial: ProfileData }) {
  const editor = useEditorState(initial, (value) => saveDataSection("profile", value));
  const { value, setValue } = editor;

  const setLink = (key: keyof ProfileData["links"], v: string | null) =>
    setValue((p) => ({ ...p, links: { ...p.links, [key]: v ?? "" } }));

  return (
    <div className="grid gap-5">
      <section className="glass rounded-3xl p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Photo &amp; CV</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The photo appears in the hero card and the CV is used by every “Download CV” button.
        </p>
        <div className="mt-5 grid gap-5">
          <div>
            <Label htmlFor="photo">Profile photo</Label>
            <UploadField id="photo" value={value.links.photo} onChange={(v) => setLink("photo", v)} accept="image" />
          </div>
          <div>
            <Label htmlFor="cv">CV (PDF)</Label>
            <UploadField id="cv" value={value.links.cv} onChange={(v) => setLink("cv", v)} accept="pdf" />
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Research metrics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown in the hero card and the Impact section. Copy them from Google Scholar when they change.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {value.metrics.map((metric, index) => (
            <div key={metric.id}>
              <Label htmlFor={`metric-${metric.id}`}>{metricLabels[metric.id]}</Label>
              <Input
                id={`metric-${metric.id}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={String(metric.value)}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  setValue((p) => ({
                    ...p,
                    metrics: p.metrics.map((m, i) => (i === index ? { ...m, value: Number.isNaN(n) ? 0 : n } : m)),
                  }));
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-5 sm:p-7">
        <h2 className="text-lg font-semibold">Links</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used in the contact section, the footer and the publications list. Leave one empty to hide it.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["scholar", "Google Scholar profile"],
              ["fayoum", "Fayoum University page"],
              ["mbrf", "MBRF page"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`link-${key}`}>{label}</Label>
              <Input
                id={`link-${key}`}
                dir="ltr"
                value={value.links[key]}
                placeholder="https://…"
                onChange={(e) => setLink(key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <Label htmlFor="verified">Verified email domain</Label>
            <Input
              id="verified"
              dir="ltr"
              value={value.verifiedDomain}
              onChange={(e) => setValue((p) => ({ ...p, verifiedDomain: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <SaveBar
        dirty={editor.dirty}
        pending={editor.pending}
        result={editor.result}
        onSave={editor.submit}
        onDiscard={editor.discard}
      />
    </div>
  );
}
