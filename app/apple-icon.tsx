import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
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
        <div style={{ position: "relative", width: 110, height: 110, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 11,
              top: 55,
              width: 64,
              height: 47,
              borderRadius: "50%",
              background: "#7c5cff",
              transform: "rotate(-20deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 67,
              top: 9,
              width: 8,
              height: 70,
              background: "#7c5cff",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
