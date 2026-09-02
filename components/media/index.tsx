import type { Media, ValueOption } from "@/lib/engine/types";
import { CirclePicker } from "./CirclePicker";
import { PianoKeyboard } from "./PianoKeyboard";
import { PianoPicker } from "./PianoPicker";
import { StaffMedia, STAFF_COLORS } from "./StaffMedia";
import { SignatureWriter } from "./SignatureWriter";
import { StaffPicker } from "./StaffPicker";

const naming = (value: unknown): "solfege" | "letters" =>
  value === "letters" ? "letters" : "solfege";

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
          keySignature={
            media.payload.keySignature
              ? String(media.payload.keySignature)
              : undefined
          }
          notes={String(media.payload.notes ?? "")
            .split(",")
            .filter(Boolean)
            .map((key) => ({ key, color: STAFF_COLORS.ink }))}
        />
      );
    case "piano":
      return (
        <PianoKeyboard
          marks={[
            { semitone: Number(media.payload.from), color: STAFF_COLORS.muted },
            { semitone: Number(media.payload.to), color: STAFF_COLORS.accent },
          ]}
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
  const shared = { options, value, state, locked, accepted, onAnswer };

  switch (render.kind) {
    case "staff-picker":
      return (
        <StaffPicker
          clef={String(render.payload.clef)}
          given={
            render.payload.given ? String(render.payload.given) : undefined
          }
          {...shared}
        />
      );
    case "circle-picker":
      return <CirclePicker naming={naming(render.payload.naming)} {...shared} />;
    case "signature-writer":
      return (
        <SignatureWriter
          clef={String(render.payload.clef)}
          glyph={String(render.payload.glyph)}
          count={Number(render.payload.count)}
          correctSignature={String(render.payload.correctSignature)}
          {...shared}
        />
      );
    case "piano-picker":
      return (
        <PianoPicker
          start={Number(render.payload.start)}
          naming={naming(render.payload.naming)}
          {...shared}
        />
      );
    default:
      return null;
  }
}
