import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** A notehead and stem, drawn with boxes so no font has to load. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080a",
        }}
      >
        <div style={{ position: "relative", width: 44, height: 44, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 22,
              width: 26,
              height: 19,
              borderRadius: "50%",
              background: "#7c5cff",
              transform: "rotate(-20deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 27,
              top: 3,
              width: 4,
              height: 28,
              background: "#7c5cff",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
