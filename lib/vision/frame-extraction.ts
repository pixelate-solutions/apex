import type { VisionFrame } from "@/lib/types/shot";

export type ExtractFrameOptions = {
  fps: number;
  startFrameIndex: number;
  frameCount: number;
  maxWidth?: number;
  onProgress?: (progress: number) => void;
};

function waitForSeek(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Unable to read frames from this video."));
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

export async function extractFrames(video: HTMLVideoElement, options: ExtractFrameOptions): Promise<VisionFrame[]> {
  if (!video.videoWidth || !video.videoHeight) {
    await new Promise<void>((resolve) => video.addEventListener("loadedmetadata", () => resolve(), { once: true }));
  }

  const scale = options.maxWidth && video.videoWidth > options.maxWidth ? options.maxWidth / video.videoWidth : 1;
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available in this browser.");

  const frames: VisionFrame[] = [];
  const frameDuration = 1 / options.fps;

  for (let i = 0; i < options.frameCount; i += 1) {
    const frameIndex = options.startFrameIndex + i;
    const time = frameIndex * frameDuration;
    video.currentTime = Math.min(time, Math.max(0, video.duration || time));
    await waitForSeek(video);
    context.drawImage(video, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    frames.push({
      frameIndex,
      timestampMs: time * 1000,
      width,
      height,
      imageData,
      dataUrl: i === 0 ? canvas.toDataURL("image/jpeg", 0.74) : undefined,
    });
    options.onProgress?.(Math.round(((i + 1) / options.frameCount) * 100));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  }

  return frames;
}
