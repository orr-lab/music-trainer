import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
        <div style={{ position: "relative", width: 300, height: 300, display: "flex" }}>
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 150,
              width: 175,
              height: 128,
              borderRadius: "50%",
              background: "#7c5cff",
              transform: "rotate(-20deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 183,
              top: 24,
              width: 22,
              height: 190,
              background: "#7c5cff",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
