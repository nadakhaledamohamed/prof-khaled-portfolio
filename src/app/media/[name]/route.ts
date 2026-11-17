import { contentTypeFor, MEDIA_NAME, readMedia } from "@/server/media";

export const runtime = "nodejs";

/** Serves files uploaded through the admin panel. Names are random UUIDs, so responses cache forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!MEDIA_NAME.test(name)) return new Response("Not found", { status: 404 });

  const file = await readMedia(name);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentTypeFor(name),
      "Content-Length": String(file.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
