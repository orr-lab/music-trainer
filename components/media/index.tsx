import type { QuestionMedia } from "@/lib/engine/types";
import { StaffMedia } from "./StaffMedia";

/**
 * Maps a question's media kind to a renderer. The engine never sees this - a
 * new kind of visual prompt is one case here plus one component.
 */
export function QuestionMediaView({ media }: { media: QuestionMedia }) {
  switch (media.kind) {
    case "staff":
      return (
        <StaffMedia
          clef={String(media.payload.clef)}
          note={String(media.payload.note)}
        />
      );
    default:
      return null;
  }
}
