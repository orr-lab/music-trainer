import type { Media, ValueOption } from "@/lib/engine/types";
import { StaffMedia, STAFF_COLORS } from "./StaffMedia";
import { StaffPicker } from "./StaffPicker";

/**
 * Maps a media kind to a renderer. The engine never sees this - a new kind of
 * visual prompt, or a new way of giving an answer, is one case here plus one
 * component.
 */
export function QuestionMediaView({ media }: { media: Media }) {
  switch (media.kind) {
    case "staff":
      return (
        <StaffMedia
          clef={String(media.payload.clef)}
          notes={String(media.payload.notes)
            .split(",")
            .filter(Boolean)
            .map((key) => ({ key, color: STAFF_COLORS.ink }))}
        />
      );
    default:
      return null;
  }
}

/** The same idea for an answer input that draws itself. */
export function AnswerMediaView({
  render,
  options,
  value,
  state,
  locked,
  accepted,
  onAnswer,
}: {
  render: Media;
  options: ValueOption[];
  value: string | undefined;
  state: "idle" | "correct" | "wrong";
  locked: boolean;
  accepted: string[];
  onAnswer: (value: string) => void;
}) {
  switch (render.kind) {
    case "staff-picker":
      return (
        <StaffPicker
          clef={String(render.payload.clef)}
          given={String(render.payload.given)}
          options={options}
          value={value}
          state={state}
          locked={locked}
          accepted={accepted}
          onAnswer={onAnswer}
        />
      );
    default:
      return null;
  }
}
