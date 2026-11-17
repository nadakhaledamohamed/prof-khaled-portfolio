import { ImageResponse } from "next/og";
import { getDictionary } from "@/content";
import { monogram } from "@/data/site";

export const dynamic = "force-static";

/** Social-share image (1200×630). Uses the English profile text, which renders in the default font. */
export function GET() {
  const t = getDictionary("en");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#edf0f7",
          backgroundColor: "#070a12",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(50,70,211,0.9) 0%, rgba(7,10,18,0) 55%), radial-gradient(circle at 100% 100%, rgba(14,143,149,0.8) 0%, rgba(7,10,18,0) 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              background: "linear-gradient(120deg, #8c9bff, #5eead4)",
              color: "#070a12",
            }}
          >
            {monogram}
          </div>
          <div style={{ fontSize: 26, opacity: 0.8 }}>{t.profile.tagline}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {t.profile.fullTitle}
          </div>
          <div style={{ marginTop: 24, fontSize: 32, opacity: 0.8 }}>{t.hero.eyebrow}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
