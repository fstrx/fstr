import { securityTxt } from "@/lib/files";

// RFC 9116 — generated from /content so it never drifts from the editor copy
export function GET() {
  return new Response(securityTxt() + "\n", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
