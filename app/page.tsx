"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Monitor, Moon, Sun, Plus, ArrowUpRight, Menu, X } from "lucide-react";
import { Reveal, RevealSection } from "@/components/motion/reveal";

type Theme = "dark" | "light" | "system";

const landingNavItems = ["Product", "Metrics", "Specs", "Pricing"] as const;

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isSignedIn } = useAuth();

  return (
    <div className="lp" data-lp-theme={theme} style={{ minHeight: "100vh" }}>
      <LPNav theme={theme} setTheme={setTheme} isSignedIn={!!isSignedIn} />
      <LPHero />
      <LPHowItWorks />
      <LPMetrics />
      <LPSpecs />
      <LPPricing />
      <LPFAQ openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <LPFinalCTA />
      <LPFooter />
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function LPNav({
  theme,
  setTheme,
  isSignedIn,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isSignedIn: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="lp-nav"
      style={{
        position: "fixed",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--lp-line)",
        background: "color-mix(in oklch, var(--lp-bg) 92%, transparent)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        className="lp-nav-inner"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: 7,
              background: "var(--lp-accent)",
              color: "oklch(0.14 0.010 260)",
            }}
          >
            <Activity size={15} strokeWidth={2.5} />
          </span>
          <span className="lp-mono" style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.18em", color: "var(--lp-ink)" }}>
            APEX
          </span>
        </Link>

        {/* Nav links */}
        <div className="lp-nav-links" style={{ display: "flex", gap: 28, flex: 1 }}>
          {landingNavItems.map((label, index) => (
            <motion.a
              key={label}
              href={`#${label.toLowerCase()}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              whileHover={{ y: -2, color: "var(--lp-ink)" }}
              style={{ fontSize: 13, color: "var(--lp-ink3)", textDecoration: "none", fontWeight: 500 }}
            >
              {label}
            </motion.a>
          ))}
        </div>

        {/* Right side */}
        <div className="lp-nav-actions lp-desktop-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--lp-ink2)",
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--lp-line)",
                  background: "var(--lp-bg2)",
                }}
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <GetStartedButton size="nav" />
          )}
        </div>

        <button
          className="lp-menu-button"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="lp-mobile-panel"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lp-mobile-panel-inner">
              {landingNavItems.map((label, index) => (
                <motion.a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.035 }}
                  className="lp-mobile-link"
                >
                  {label}
                </motion.a>
              ))}
              <div className="lp-mobile-actions">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                {isSignedIn ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="lp-mobile-dashboard-link">
                      Dashboard
                    </Link>
                    <UserButton />
                  </>
                ) : (
                  <GetStartedButton size="nav" fullWidth />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const options: { value: Theme; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun size={13} /> },
    { value: "system", icon: <Monitor size={13} /> },
    { value: "dark", icon: <Moon size={13} /> },
  ];
  return (
    <div
      style={{
        display: "flex",
        border: "1px solid var(--lp-line)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--lp-bg2)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 28,
            border: "none",
            cursor: "pointer",
            background: theme === opt.value ? "var(--lp-accent)" : "transparent",
            color: theme === opt.value ? "oklch(0.14 0.010 260)" : "var(--lp-ink3)",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

function GetStartedButton({
  size = "default",
  tone = "accent",
  fullWidth = false,
}: {
  size?: "nav" | "default" | "large";
  tone?: "accent" | "subtle";
  fullWidth?: boolean;
}) {
  const isNav = size === "nav";
  const isLarge = size === "large";
  const accent = tone === "accent";

  return (
    <Link
      href="/dashboard"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : undefined,
        marginTop: fullWidth && size !== "nav" ? 24 : undefined,
        padding: isNav ? "7px 16px" : isLarge ? "13px 28px" : "11px 22px",
        background: accent ? "var(--lp-accent)" : "var(--lp-bg3)",
        color: accent ? "oklch(0.14 0.010 260)" : "var(--lp-ink2)",
        border: accent ? "none" : "1px solid var(--lp-line)",
        borderRadius: isNav ? 8 : 10,
        fontSize: isNav ? 13 : isLarge ? 15 : 14,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        textDecoration: "none",
      }}
    >
      Get started
      {!isNav && <ArrowUpRight size={isLarge ? 16 : 15} strokeWidth={2.5} />}
    </Link>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function LPHero() {
  return (
    <RevealSection
      id="product"
      className="lp-grid-bg"
      style={{ padding: "80px 24px 72px", position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 70% 50%, oklch(0.82 0.18 130 / 0.06), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        className="lp-hero-layout"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <Reveal className="lp-hero-copy">
          <div
            className="lp-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--lp-accent)",
              marginBottom: 20,
              fontWeight: 700,
            }}
          >
            PROFESSIONAL GRADE RADAR + VISION
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(38px, 5vw, 58px)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "var(--lp-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Tour-grade launch data. A fraction of the price.
          </h1>
          <p
            style={{
              marginTop: 20,
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--lp-ink3)",
              maxWidth: 480,
            }}
          >
            Apex is a hybrid radar and high-speed camera launch monitor that measures ball speed, spin rate, launch
            angle, carry, club path, and more with professional accuracy. No subscriptions. No compromises.
          </p>

          <div className="lp-hero-actions" style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <GetStartedButton />
            <a
              href="#metrics"
              style={{
                display: "flex",
                alignItems: "center",
                padding: "11px 22px",
                background: "var(--lp-bg2)",
                color: "var(--lp-ink2)",
                border: "1px solid var(--lp-line)",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              See metrics
            </a>
          </div>

          <div className="lp-hero-stats" style={{ display: "flex", gap: 28, marginTop: 40, flexWrap: "wrap" }}>
          {[
              ["±1 mph", "ball speed"],
              ["±0.5°", "launch angle"],
              ["±75 rpm", "spin rate"],
              ["No fees", "subscription-free"],
            ].map(([val, label], index) => (
              <Reveal key={label} delay={0.08 + index * 0.04}>
                <div
                  className="lp-mono"
                  style={{ fontSize: 20, fontWeight: 700, color: "var(--lp-accent)", lineHeight: 1 }}
                >
                  {val}
                </div>
                <div style={{ fontSize: 11, color: "var(--lp-ink4)", marginTop: 3 }}>{label}</div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <HeroDevice />
      </div>
    </RevealSection>
  );
}

// ─── HERO DEVICE MOCKUP ───────────────────────────────────────────────────────
function HeroDevice() {
  const pts: [number, number][] = [
    [8, 52], [14, 43], [22, 35], [31, 28], [41, 22], [52, 18],
    [63, 17], [74, 20], [83, 25], [90, 30],
  ];

  return (
    <Reveal delay={0.08} style={{ position: "relative" }}>
      <div
        style={{
          background: "var(--lp-bg2)",
          border: "1px solid var(--lp-line)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 32px 80px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(0 0 0 / 0.2)",
        }}
      >
        {/* Top bar */}
        <div
          className="lp-mono"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 14px",
            borderBottom: "1px solid var(--lp-line-soft)",
            fontSize: 10,
            color: "var(--lp-ink4)",
          }}
        >
          <span style={{ color: "var(--lp-accent)", fontWeight: 700 }}>APEX LAUNCH MONITOR</span>
          <span>CAM A · 480 FPS</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--lp-accent)",
                display: "inline-block",
                animation: "lp-pulse 1.2s ease-in-out infinite",
              }}
            />
            REC
          </span>
        </div>

        {/* SVG viewport */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <svg viewBox="0 0 100 60" width="100%" style={{ display: "block", aspectRatio: "100/60" }}>
            {[20, 40, 60, 80].map((x) => (
              <line key={`vg-${x}`} x1={x} y1={0} x2={x} y2={60} stroke="var(--lp-grid)" strokeWidth={0.3} />
            ))}
            {[20, 40].map((y) => (
              <line key={`hg-${y}`} x1={0} y1={y} x2={100} y2={y} stroke="var(--lp-grid)" strokeWidth={0.3} />
            ))}
            <polyline
              points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
              stroke="var(--lp-accent)"
              strokeWidth={0.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6}
            />
            <polyline
              points={[...pts.slice(-3), [95, 34] as [number, number]]
                .map(([x, y]) => `${x},${y}`)
                .join(" ")}
              stroke="var(--lp-accent)"
              strokeWidth={0.4}
              fill="none"
              strokeDasharray="1 1"
              opacity={0.35}
            />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={0.7} fill="var(--lp-accent)" opacity={0.5 + i * 0.05} />
            ))}
            {/* Live reticle */}
            <circle cx={63} cy={17} r={3.5} stroke="var(--lp-accent)" strokeWidth={0.6} fill="none" />
            <line x1={63} y1={11} x2={63} y2={9} stroke="var(--lp-accent)" strokeWidth={0.6} />
            <line x1={63} y1={23} x2={63} y2={25} stroke="var(--lp-accent)" strokeWidth={0.6} />
            <line x1={57} y1={17} x2={55} y2={17} stroke="var(--lp-accent)" strokeWidth={0.6} />
            <line x1={69} y1={17} x2={71} y2={17} stroke="var(--lp-accent)" strokeWidth={0.6} />
            {/* Corner ticks */}
            {(
              [
                [2, 2, 5, 2, 2, 5],
                [98, 2, 95, 2, 98, 5],
                [2, 58, 5, 58, 2, 55],
                [98, 58, 95, 58, 98, 55],
              ] as [number, number, number, number, number, number][]
            ).map(([x1, y1, x2, y2, x3, y3], i) => (
              <g key={i} stroke="var(--lp-line)" strokeWidth={0.5} fill="none">
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <line x1={x1} y1={y1} x2={x3} y2={y3} />
              </g>
            ))}
          </svg>
          {/* Scanning line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--lp-accent), transparent)",
              opacity: 0.3,
              animation: "lp-scan 3s linear infinite",
              top: 0,
            }}
          />
        </div>

        {/* Live metrics strip */}
        <div
          className="lp-mono"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "1px solid var(--lp-line-soft)",
            fontSize: 10,
          }}
        >
          {[
            ["BALL SPEED", "148.2", "MPH"],
            ["LAUNCH ANG", "14.6", "DEG"],
            ["SPIN RATE", "2,847", "RPM"],
            ["CARRY EST", "248", "YDS"],
          ].map(([label, val, unit], i) => (
            <div
              key={label}
              style={{
                padding: "8px 10px",
                borderLeft: i > 0 ? "1px solid var(--lp-line-soft)" : undefined,
              }}
            >
              <div style={{ color: "var(--lp-ink4)", fontSize: 9, marginBottom: 2 }}>{label}</div>
              <div style={{ color: "var(--lp-accent)", fontWeight: 700, fontSize: 14 }}>
                {val}
                <span style={{ fontSize: 9, fontWeight: 400, color: "var(--lp-ink3)", marginLeft: 2 }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div
          className="lp-mono"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 14px",
            borderTop: "1px solid var(--lp-line-soft)",
            fontSize: 9,
            color: "var(--lp-ink4)",
            background: "var(--lp-bg3)",
          }}
        >
          <span>FRAME 184 / 412</span>
          <span>T+ 00:00.762</span>
          <span>DRIVER · SHOT 04</span>
          <span style={{ color: "var(--lp-accent)" }}>CONF 0.97</span>
        </div>
      </div>
    </Reveal>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function LPHowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Set up",
      desc: "Place the camera unit 5 feet from the ball, radar unit 7 feet behind you. Power on and connect to the Apex tablet app in under 2 minutes.",
    },
    {
      n: "02",
      title: "Calibrate once",
      desc: "A single calibration session stores your camera intrinsics, extrinsics, and radar alignment. Re-run only if you move a unit.",
    },
    {
      n: "03",
      title: "Hit",
      desc: "Radar triggers on club movement. Cameras capture a 200ms window. The full analysis pipeline runs in under one second.",
    },
    {
      n: "04",
      title: "Review",
      desc: "Shot data appears instantly on your tablet with full metrics, trajectory visualization, and historical trends.",
    },
  ];

  return (
    <RevealSection style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-line)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader kicker="HOW IT WORKS" title="From setup to data in minutes" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            marginTop: 48,
          }}
        >
          {steps.map((s, index) => (
            <Reveal
              key={s.n}
              delay={index * 0.05}
              style={{
                padding: "28px 24px",
                background: "var(--lp-bg2)",
                borderRadius: 2,
              }}
            >
              <div
                className="lp-mono"
                style={{ fontSize: 11, fontWeight: 700, color: "var(--lp-accent)", marginBottom: 12 }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-ink)", marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--lp-ink3)" }}>{s.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

// ─── METRICS ──────────────────────────────────────────────────────────────────
function LPMetrics() {
  const ballMetrics = [
    { k: "Ball Speed", range: "50 to 200 mph", acc: "±1 mph", method: "Radar primary" },
    { k: "Launch Angle", range: "-5° to 45°", acc: "±0.5°", method: "Camera primary" },
    { k: "Spin Rate", range: "1,000 to 12,000 rpm", acc: "±75 rpm", method: "Logo and dimple tracking" },
    { k: "Spin Axis", range: "0 to 360°", acc: "±3°", method: "Dual-view analysis" },
    { k: "Carry Distance", range: "50 to 350 yds", acc: "±3 yds", method: "Physics model" },
    { k: "Total Distance", range: "50 to 400 yds", acc: "±5 yds", method: "Physics + roll sim" },
  ];
  const clubMetrics = [
    { k: "Club Speed", range: "40 to 150 mph", acc: "±1.5 mph", method: "Radar" },
    { k: "Smash Factor", range: "1.0 to 1.5", acc: "±0.02", method: "Calculated" },
    { k: "Club Path", range: "Full range", acc: "±2°", method: "D-plane + spin fusion" },
    { k: "Face Angle", range: "Full range", acc: "±2°", method: "D-plane + spin fusion" },
    { k: "Attack Angle", range: "Full range", acc: "±1°", method: "Calculated" },
    { k: "Dynamic Loft", range: "Full range", acc: "±2°", method: "Calculated" },
  ];

  return (
    <RevealSection
      id="metrics"
      className="lp-grid-bg"
      style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-line)" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          kicker="MEASUREMENTS"
          title="Every number that matters"
          sub="Complete ball and club data from every shot. No guessing, no estimation."
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48 }}>
          <MetricGroup title="Ball flight" metrics={ballMetrics} delay={0} />
          <MetricGroup title="Club delivery" metrics={clubMetrics} delay={0.06} />
        </div>
      </div>
    </RevealSection>
  );
}

function MetricGroup({
  title,
  metrics,
  delay = 0,
}: {
  title: string;
  metrics: { k: string; range: string; acc: string; method: string }[];
  delay?: number;
}) {
  return (
    <Reveal
      delay={delay}
      style={{
        background: "var(--lp-bg2)",
        border: "1px solid var(--lp-line)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        className="lp-mono"
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--lp-line)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "var(--lp-ink3)",
        }}
      >
        {title.toUpperCase()}
      </div>
      {metrics.map((m, i) => (
        <div
          key={m.k}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            padding: "12px 20px",
            borderTop: i > 0 ? "1px solid var(--lp-line-soft)" : undefined,
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--lp-ink)" }}>{m.k}</div>
            <div style={{ fontSize: 12, color: "var(--lp-ink4)", marginTop: 2 }}>
              {m.method} · {m.range}
            </div>
          </div>
          <div
            className="lp-mono"
            style={{ fontSize: 13, fontWeight: 700, color: "var(--lp-accent)", textAlign: "right", alignSelf: "center" }}
          >
            {m.acc}
          </div>
        </div>
      ))}
    </Reveal>
  );
}

// ─── SPECS ────────────────────────────────────────────────────────────────────
function LPSpecs() {
  const specGroups = [
    {
      title: "Camera unit",
      items: [
        ["Frame rate", "480 fps (up to 960 fps burst)"],
        ["Resolution", "1920 × 1080"],
        ["Lighting", "10,000+ lux integrated LED"],
        ["Shutter", "Global, 1/10,000s"],
        ["Mount", "Standard tripod, 5/8\" thread"],
        ["Range", "Up to 15 ft from ball"],
      ],
    },
    {
      title: "Radar unit",
      items: [
        ["Technology", "24 GHz Doppler"],
        ["Speed range", "50 to 200 mph"],
        ["Trigger", "Club-swing auto-trigger"],
        ["Weather rating", "IP54"],
        ["Placement", "7 ft behind ball, inline"],
        ["Latency", "<50 ms detection"],
      ],
    },
    {
      title: "Software",
      items: [
        ["Platform", "iOS / iPadOS 16+"],
        ["Pipeline latency", "<1 second end to end"],
        ["Capture window", "200ms around impact"],
        ["Storage", "Local + optional cloud sync"],
        ["Export", "CSV per shot"],
        ["Updates", "OTA, included"],
      ],
    },
    {
      title: "In the box",
      items: [
        ["Camera unit", "1x high-speed camera"],
        ["Radar unit", "1x 24 GHz radar"],
        ["Tripods", "2x carbon fiber"],
        ["Power", "Dual battery packs (8h)"],
        ["Case", "Pelican carry case"],
        ["Warranty", "2 years, full coverage"],
      ],
    },
  ];

  return (
    <RevealSection id="specs" className="lp-grid-bg" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-line)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader kicker="SPECIFICATIONS" title="Built to last" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 48,
          }}
        >
          {specGroups.map((g, index) => (
            <Reveal
              key={g.title}
              delay={index * 0.04}
              style={{
                background: "var(--lp-bg2)",
                border: "1px solid var(--lp-line)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                className="lp-mono"
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--lp-line)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "var(--lp-ink3)",
                }}
              >
                {g.title.toUpperCase()}
              </div>
              {g.items.map(([k, v], i) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 16px",
                    borderTop: i > 0 ? "1px solid var(--lp-line-soft)" : undefined,
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--lp-ink4)" }}>{k}</span>
                  <span style={{ fontSize: 12, color: "var(--lp-ink2)", fontWeight: 500, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function LPPricing() {
  const plans = [
    {
      name: "Apex One",
      price: "$1,999",
      desc: "Single camera unit for range and simulator use.",
      badge: undefined as string | undefined,
      tone: "default" as "default" | "accent",
      features: [
        "1x high-speed camera (480 fps)",
        "Vision-only ball tracking",
        "Ball speed, launch angle, carry",
        "Spin rate via logo tracking",
        "iOS app included",
        "Local storage, CSV export",
        "1-year warranty",
      ],
    },
    {
      name: "Apex Pro",
      price: "$2,999",
      desc: "Dual-sensor radar and vision bundle. The full Apex experience.",
      badge: "Most popular",
      tone: "accent" as "default" | "accent",
      features: [
        "1x high-speed camera + 1x radar",
        "Radar + vision Kalman fusion",
        "All ball and club metrics",
        "Spin axis, smash factor, d-plane",
        "Auto-trigger on club swing",
        "iOS app + cloud sync",
        "2-year warranty",
      ],
    },
    {
      name: "Apex Studio",
      price: "$5,499",
      desc: "Multi-camera studio installation for club fitting and coaching.",
      badge: undefined,
      tone: "default" as "default" | "accent",
      features: [
        "2x high-speed cameras + radar",
        "Dual-view 3D spin axis analysis",
        "Full 3D trajectory reconstruction",
        "Fitting mode with bag comparison",
        "Multi-user accounts",
        "Priority support + setup call",
        "2-year warranty, on-site service",
      ],
    },
  ];

  return (
    <RevealSection id="pricing" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-line)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          kicker="PRICING"
          title="No subscriptions. One price."
          sub="Buy once. Every software update included. Two-year warranty on all hardware."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 48,
          }}
        >
          {plans.map((p, index) => (
            <Reveal
              key={p.name}
              delay={index * 0.05}
              style={{
                background: p.tone === "accent" ? "oklch(0.82 0.18 130 / 0.07)" : "var(--lp-bg2)",
                border: `1px solid ${p.tone === "accent" ? "var(--lp-accent)" : "var(--lp-line)"}`,
                borderRadius: 14,
                padding: "28px 24px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {p.badge && (
                <div
                  className="lp-mono"
                  style={{
                    position: "absolute",
                    top: -11,
                    left: 20,
                    background: "var(--lp-accent)",
                    color: "oklch(0.14 0.010 260)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    letterSpacing: "0.08em",
                  }}
                >
                  {p.badge.toUpperCase()}
                </div>
              )}
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-ink)" }}>{p.name}</div>
              <div
                className="lp-mono"
                style={{ fontSize: 36, fontWeight: 900, color: "var(--lp-ink)", marginTop: 8, lineHeight: 1 }}
              >
                {p.price}
              </div>
              <div style={{ fontSize: 13, color: "var(--lp-ink3)", marginTop: 10, lineHeight: 1.5 }}>{p.desc}</div>
              <div style={{ borderTop: "1px solid var(--lp-line)", margin: "20px 0" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Plus size={12} style={{ color: "var(--lp-accent)", flexShrink: 0, marginTop: 3 }} strokeWidth={3} />
                    <span style={{ fontSize: 13, color: "var(--lp-ink2)", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <GetStartedButton fullWidth tone={p.tone === "accent" ? "accent" : "subtle"} />
            </Reveal>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function LPFAQ({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number | null;
  setOpenFaq: (i: number | null) => void;
}) {
  const qs = [
    [
      "What clubs work with Apex?",
      "All of them. Apex works with any club from driver through wedge. Club type informs the physics model for smash factor and distance calculations.",
    ],
    [
      "Do I need to re-calibrate every session?",
      "No. Calibration is stored on the device. Re-run it only if you physically move a sensor unit. A quick system check verifies alignment before each session.",
    ],
    [
      "Does it work indoors?",
      "Yes. The camera unit ships with 10,000+ lux LED panels designed for indoor use. Net practice, simulators, and hitting bays all work.",
    ],
    [
      "How long does setup take?",
      "Under 2 minutes once calibrated. Place two tripods, power on, connect via the app. The sensor units auto-discover each other on the local network.",
    ],
    [
      "What happens when the wind picks up?",
      "Apex is operational in winds up to 25 mph. Above 15 mph, accuracy on carry distance degrades slightly. Ball speed and launch angle measurements are not affected by wind.",
    ],
    [
      "Can I export my data?",
      "Yes. Every shot exports as CSV from the app. Full shot history is stored locally and optionally synced to your Apex account.",
    ],
  ];

  return (
    <RevealSection className="lp-grid-bg" style={{ padding: "80px 24px", borderTop: "1px solid var(--lp-line)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <SectionHeader kicker="FAQ" title="Common questions" />
        <div style={{ marginTop: 48 }}>
          {qs.map(([q, a], i) => (
            <Reveal key={i} delay={i * 0.025} style={{ borderTop: "1px solid var(--lp-line)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--lp-ink)", lineHeight: 1.4 }}>
                  <span className="lp-mono" style={{ color: "var(--lp-accent)", marginRight: 10, fontSize: 11 }}>
                    Q.
                  </span>
                  {q}
                </span>
                <span
                  style={{
                    color: "var(--lp-ink4)",
                    flexShrink: 0,
                    fontSize: 20,
                    lineHeight: 1,
                    display: "inline-block",
                    transform: openFaq === i ? "rotate(45deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: -6 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -6 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      overflow: "hidden",
                      paddingBottom: 18,
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "var(--lp-ink3)",
                      paddingLeft: 28,
                    }}
                  >
                    {a}
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          ))}
          <div style={{ borderTop: "1px solid var(--lp-line)" }} />
        </div>
      </div>
    </RevealSection>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function LPFinalCTA() {
  return (
    <RevealSection
      style={{
        padding: "100px 24px",
        borderTop: "1px solid var(--lp-line)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, oklch(0.82 0.18 130 / 0.07), transparent)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
        <div
          className="lp-mono"
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "var(--lp-accent)",
            border: "1px solid oklch(0.82 0.18 130 / 0.4)",
            borderRadius: 20,
            padding: "4px 12px",
            marginBottom: 28,
          }}
        >
          SHIPS IN 2 WEEKS
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 900,
            color: "var(--lp-ink)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Hit better. Know why.
        </h2>
        <p style={{ marginTop: 16, fontSize: 16, color: "var(--lp-ink3)", lineHeight: 1.6 }}>
          Professional launch monitor data for serious golfers, coaches, and club fitters. No subscriptions.
          Two-year warranty.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center" }}>
          <GetStartedButton size="large" />
          <a
            href="#metrics"
            style={{
              padding: "13px 28px",
              background: "var(--lp-bg2)",
              color: "var(--lp-ink2)",
              border: "1px solid var(--lp-line)",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Download spec sheet
          </a>
        </div>
      </div>
    </RevealSection>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function LPFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--lp-line)",
        padding: "28px 24px",
        background: "var(--lp-bg2)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--lp-accent)",
              color: "oklch(0.14 0.010 260)",
            }}
          >
            <Activity size={12} strokeWidth={2.5} />
          </span>
          <span
            className="lp-mono"
            style={{ fontWeight: 900, fontSize: 11, letterSpacing: "0.18em", color: "var(--lp-ink3)" }}
          >
            APEX
          </span>
        </Link>
        <span className="lp-mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--lp-ink4)" }}>
          TWO-YEAR WARRANTY · FREE SHIPPING · 30-DAY RETURNS
        </span>
        <span className="lp-mono" style={{ fontSize: 10, color: "var(--lp-ink4)" }}>
          © APEX LABS 2026
        </span>
      </div>
    </footer>
  );
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function SectionHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div>
      <div
        className="lp-mono"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "var(--lp-accent)",
          marginBottom: 14,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 900,
          color: "var(--lp-ink)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ margin: "12px 0 0", fontSize: 15, color: "var(--lp-ink3)", maxWidth: 600, lineHeight: 1.6 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
