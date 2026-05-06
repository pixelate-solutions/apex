# Apex

Apex is a production-quality POC for a golf launch monitor software platform. It proves the browser workflow for importing slow-motion launch video, calibrating ball scale, tracking the golf ball frame by frame, and estimating basic launch metrics while establishing backend, account, storage, hardware, and future CV integration boundaries.

## Current POC

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui-style source components in `components/ui`.
- Bubbly, rounded, app-like UI with a fixed desktop sidebar and responsive mobile top navigation.
- Dashboard workspace for shot totals, quality signals, system readiness, latest shot summary, and recent shots.
- Drag-and-drop video upload for `.mp4`, `.mov`, and `.webm`.
- Client-side video preview and frame extraction with `HTMLVideoElement` plus Canvas.
- Modular TypeScript computer vision pipeline in `lib/vision`, wrapped by a `VisionEngine` interface in `lib/integrations/vision`.
- Basic launch metrics in `lib/physics`: ball speed, launch angle, rough carry, diagnostics, and confidence.
- Local browser persistence for settings and analyzed shots.
- Clerk-managed authentication for sign-in, sign-up, sessions, and user profile controls.
- Clerk-authorized backend shot persistence keyed by Clerk user ID.
- Local object-storage adapter for source videos and thumbnails, plus an S3-compatible adapter stub.
- High-speed camera, radar, radar/video fusion, OpenCV/WASM, Python service, spin, stereo, and camera intrinsic adapter boundaries.
- Automated synthetic sample-video tests and a benchmark manifest.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local` from `.env.example` and set your Clerk keys:

```bash
cp .env.example .env.local
```

Required Clerk values:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Test And Benchmark

```bash
npm run lint
npx tsc --noEmit
npm run test
npm run benchmark
npm run build
```

The synthetic benchmark clip metadata lives in `benchmarks/sample-clips.json`, with generated pixel fixtures in `test/fixtures/synthetic-launch.ts`.

## Using A Sample Video

1. Sign in or create a Clerk account in `/account` if you want backend shot sync and source-video object storage.
2. Go to `/analyze` and drag/drop or select a slow-motion `.mp4`, `.mov`, or `.webm`.
3. Confirm FPS, scrub to the first usable frame, and place the calibration circle on the ball.
4. Track 10-60 frames, manually correct obvious outlier points, and review metrics.
5. Save the analysis locally. If signed in, Apex also uploads the source video, thumbnail, and shot record through backend APIs.
6. View saved browser shots in `/shots`.

## Backend APIs

- Clerk middleware protects and hydrates auth state through `@clerk/nextjs`.
- `GET /api/auth/me`
- `GET /api/server-shots`
- `POST /api/server-shots`
- `DELETE /api/server-shots?id=...`
- `POST /api/objects`
- `GET /api/objects?key=...`

The default backend uses Clerk for identity, `data/apex-db.json` for POC shot metadata, and `data/object-storage` for local object storage. These data files are ignored by git. Set `APEX_OBJECT_STORAGE_DRIVER=s3` later to route through the S3-compatible adapter once credentials and bucket configuration are implemented.

## Limitations

- Browser video metadata usually does not expose real FPS, so the user must confirm FPS.
- Ball detection is heuristic-based and intended for high-contrast slow-motion clips.
- Carry distance is a rough projectile estimate and does not model spin, wind, launch height, full drag, or radar data.
- Clerk environment variables are required for real sign-in/sign-up outside keyless development mode.
- S3/OpenCV/Python/hardware adapters are typed boundaries and stubs until real providers are connected.
- Source videos are only stored through the backend object adapter when the user is signed in.
- This is not Trackman-level or radar-validated accuracy.

## Next Milestones

- Replace local JSON shot persistence with production database migrations while keeping Clerk user IDs as ownership keys.
- Complete the S3-compatible object storage adapter and add lifecycle policies.
- Connect a real high-speed camera SDK and radar bridge.
- Add OpenCV/WASM or Python-service tracking contracts with real benchmark videos.
- Implement marked-ball spin detection, stereo calibration capture, and camera intrinsic calibration UI.
- Add Playwright workflow tests with browser video fixtures.
