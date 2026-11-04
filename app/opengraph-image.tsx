import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "varad sharma — fstr. student, developer, founder.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  bg: "#0a0a0d",
  fg: "#e6e3dc",
  muted: "#8a8893",
  faint: "#52505c",
  line: "#1e1d26",
  accent: "#ff3e6c",
  green: "#5ff2c4",
};

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.bg,
          color: C.fg,
          padding: "64px 72px",
          fontFamily: "monospace",
          border: `1px solid ${C.line}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 26 }}>
          <span>varad</span>
          <span style={{ color: C.accent, padding: "0 14px" }}>/</span>
          <span style={{ color: C.muted }}>fstr</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 22, color: C.faint }}>
            <span style={{ color: C.green }}>{site.handle}</span>
            <span>&nbsp;~/{site.alias}</span>
          </div>
          <div style={{ display: "flex", fontSize: 92, letterSpacing: -2, marginTop: 12 }}>
            <span style={{ color: C.accent, marginRight: 28 }}>›</span>
            hi, i&apos;m varad.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: C.muted,
            borderTop: `1px solid ${C.line}`,
            paddingTop: 28,
          }}
        >
          <span>student · developer · founder</span>
          <span>{site.location.toLowerCase()}</span>
        </div>
      </div>
    ),
    size,
  );
}
