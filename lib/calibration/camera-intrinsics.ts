export type CameraIntrinsics = {
  focalLengthPx: [number, number];
  principalPointPx: [number, number];
  radialDistortion: [number, number, number];
  tangentialDistortion: [number, number];
  reprojectionErrorPx: number;
};

export function estimateUndistortedPoint(point: { x: number; y: number }, intrinsics?: CameraIntrinsics) {
  if (!intrinsics) return { ...point, corrected: false };
  // TODO: Replace this placeholder with OpenCV undistortPoints when calibration images are supported.
  return { ...point, corrected: false };
}
