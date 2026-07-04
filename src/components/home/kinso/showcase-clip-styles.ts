/** Shared Kinso-style feature clip — same treatment for every showcase MP4 + fallback mock */

export const SHOWCASE_VIDEO_CLASS =
  "block aspect-video h-auto w-full rounded-[24px] shadow-[0_28px_72px_-24px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.04)] md:rounded-[32px]";

export const SHOWCASE_MOCK_SCENE_CLASS =
  "relative aspect-video w-full min-h-[220px] overflow-hidden rounded-[24px] shadow-[0_28px_72px_-24px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.04)] md:min-h-[280px] md:rounded-[32px]";

export const SHOWCASE_FALLBACK_CLASS =
  "w-full rounded-[24px] bg-white p-5 shadow-[0_28px_72px_-24px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.04)] md:rounded-[32px] md:p-6";

/** Export spec — all three clips should match outreach-sequences.mp4 */
export const SHOWCASE_VIDEO_SPEC = {
  width: 1280,
  height: 720,
  aspect: "16:9",
  durationSec: "~7",
  format: "H.264 MP4, no audio, seamless loop",
  note: "Tight crop — UI fills frame, no white letterbox padding",
} as const;
