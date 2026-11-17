import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdmin } from "@/server/auth";
import { rulesFor, type UploadKind } from "@/server/media";

/**
 * Issues short-lived Vercel Blob upload tokens to signed-in admins.
 * The browser then uploads the file directly to Blob storage.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        if (!(await getAdmin())) throw new Error("Not signed in.");
        const kind: UploadKind =
          clientPayload === "image" || clientPayload === "pdf" ? clientPayload : "any";
        const rules = rulesFor(kind);
        return {
          allowedContentTypes: rules.types,
          maximumSizeInBytes: rules.max,
          addRandomSuffix: true,
        };
      },
      // Files are recorded by the registerMediaAction server action right after upload,
      // which also works locally where Vercel cannot call back.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload refused.";
    return NextResponse.json({ error: message }, { status: message === "Not signed in." ? 401 : 400 });
  }
}
