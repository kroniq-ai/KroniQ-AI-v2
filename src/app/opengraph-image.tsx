import { ImageResponse } from "next/og";

export const alt = "KroniQ — Your autonomous AI CMO";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #050607 0%, #0d1816 42%, #051a1f 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#f5f7fa",
              lineHeight: 1,
            }}
          >
            KroniQ
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "rgba(245,247,250,0.55)",
              maxWidth: 900,
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            Your autonomous AI CMO for founder-led growth
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
