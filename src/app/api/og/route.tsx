import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

/** Branded Open Graph / social share image (1200×630). */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a3a61 0%, #0e4c7e 60%, #2f6ea3 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 18,
              background: "white",
              color: "#0e4c7e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 56, fontWeight: 800 }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 36, fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>
          Electric · Sanitary · Fancy Lights
        </div>
        <div style={{ marginTop: 16, fontSize: 30, color: "#f59e0b", fontWeight: 700 }}>
          {`in ${siteConfig.city}, ${siteConfig.country}`}
        </div>
        <div style={{ marginTop: 24, fontSize: 24, color: "rgba(255,255,255,0.85)" }}>
          Live prices · Trusted brands · Order or request a quotation online
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
