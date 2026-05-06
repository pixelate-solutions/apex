export type StereoCalibration = {
  baselineMeters: number;
  leftCameraMatrix: number[][];
  rightCameraMatrix: number[][];
  rotation: number[][];
  translation: [number, number, number];
  reprojectionErrorPx: number;
};

export function validateStereoCalibration(calibration: StereoCalibration) {
  const warnings: string[] = [];
  if (calibration.baselineMeters <= 0) warnings.push("Stereo baseline must be positive.");
  if (calibration.reprojectionErrorPx > 1.5) warnings.push("Stereo reprojection error is high for ball flight reconstruction.");
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
