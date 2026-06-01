import { cn } from "@/lib/utils";
import type { ScreenTheme } from "@/lib/design/theme";

interface WorldCupBackgroundProps {
  theme?: ScreenTheme;
  className?: string;
}

/** Oversized curved ribbons & ball-panel shapes — always behind content */
export function WorldCupBackground({
  theme = "default",
  className,
}: WorldCupBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 overflow-hidden -z-10",
        className
      )}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#081120] via-[#0B1526] to-[#081120]" />

      {/* Shared corner ribbons */}
      <CornerRibbons theme={theme} />

      {/* Theme-specific layers */}
      {theme === "auth" && <AuthLayer />}
      {theme === "my-team" && <MyTeamLayer />}
      {theme === "predictions" && <PredictionsLayer />}
      {theme === "bets" && <BetsLayer />}
      {theme === "calendar" && <CalendarLayer />}
      {theme === "profile" && <ProfileLayer />}
      {theme === "owner" && <OwnerLayer />}

      {/* Subtle ball panel pattern overlay */}
      <BallPanelPattern theme={theme} />
    </div>
  );
}

function CornerRibbons({ theme }: { theme: ScreenTheme }) {
  const blueOpacity = theme === "predictions" ? 0.1 : 0.08;
  const redOpacity = theme === "bets" ? 0.11 : 0.07;
  const greenOpacity = theme === "calendar" ? 0.1 : 0.07;

  return (
    <>
      {/* Top-right blue flowing ribbon */}
      <svg
        className="animate-wc-ribbon-drift absolute -right-[10%] -top-[15%] h-[70vh] w-[70vw] max-w-[700px] opacity-[var(--ribbon-blue-op)]"
        style={{ "--ribbon-blue-op": blueOpacity } as React.CSSProperties}
        viewBox="0 0 800 600"
        fill="none"
        preserveAspectRatio="xMaxYMin slice"
      >
        <path
          d="M600 -50 C750 80, 820 200, 780 380 C740 560, 580 620, 420 580 C280 545, 180 480, 120 360 C60 240, 80 120, 200 40 C320 -40, 480 -30, 600 -50Z"
          fill="#0066FF"
          opacity="0.9"
        />
        <path
          d="M520 20 C640 100, 700 220, 660 360 C620 500, 500 540, 380 510 C260 480, 200 400, 180 280 C160 160, 220 80, 340 40 C460 0, 420 0, 520 20Z"
          fill="#0052CC"
          opacity="0.6"
        />
      </svg>

      {/* Bottom-left red curved segment */}
      <svg
        className="animate-wc-ribbon-drift-reverse absolute -bottom-[20%] -left-[15%] h-[65vh] w-[65vw] max-w-[650px]"
        style={{ opacity: redOpacity }}
        viewBox="0 0 700 550"
        fill="none"
        preserveAspectRatio="xMinYMax slice"
      >
        <path
          d="M-50 400 C80 320, 200 280, 340 300 C480 320, 580 400, 620 520 C660 640, 560 720, 400 680 C240 640, 100 560, 20 440 C-60 320, -80 480, -50 400Z"
          fill="#E53935"
        />
        <path
          d="M40 450 C140 390, 260 370, 360 400 C460 430, 520 500, 500 580 C480 660, 380 680, 280 640 C180 600, 100 520, 60 440 C20 360, 0 500, 40 450Z"
          fill="#D62828"
          opacity="0.7"
        />
      </svg>

      {/* Bottom-right green motion accent */}
      <svg
        className="animate-wc-ribbon-drift absolute -bottom-[10%] -right-[5%] h-[50vh] w-[50vw] max-w-[500px]"
        style={{ opacity: greenOpacity }}
        viewBox="0 0 500 400"
        fill="none"
        preserveAspectRatio="xMaxYMax slice"
      >
        <path
          d="M300 350 C420 300, 500 220, 480 120 C460 20, 360 -20, 260 20 C160 60, 100 160, 120 260 C140 360, 220 400, 300 350Z"
          fill="#00C853"
        />
        <path
          d="M340 320 C420 280, 460 200, 440 130 C420 60, 350 30, 290 60 C230 90, 190 170, 210 240 C230 310, 290 340, 340 320Z"
          fill="#00A844"
          opacity="0.65"
        />
      </svg>
    </>
  );
}

function BallPanelPattern({ theme }: { theme: ScreenTheme }) {
  const opacity =
    theme === "my-team" || theme === "profile" ? 0.06 : 0.04;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      style={{ opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="wc-panel-grid"
          x="0"
          y="0"
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="60" cy="60" r="48" fill="none" stroke="#0066FF" strokeWidth="0.5" opacity="0.4" />
          <path
            d="M60 12 C80 30, 90 50, 88 72 C86 94, 72 108, 60 108 C48 108, 34 94, 32 72 C30 50, 40 30, 60 12Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.4"
            opacity="0.25"
          />
          <path
            d="M20 60 Q40 40, 60 60 Q80 80, 100 60"
            fill="none"
            stroke="#00C853"
            strokeWidth="0.35"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wc-panel-grid)" />
    </svg>
  );
}

function AuthLayer() {
  return (
    <svg
      className="absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
      viewBox="0 0 400 400"
    >
      <circle cx="200" cy="200" r="180" fill="none" stroke="#0066FF" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="140" fill="none" stroke="#E53935" strokeWidth="1" />
      <circle cx="200" cy="200" r="100" fill="none" stroke="#00C853" strokeWidth="1" />
      <path
        d="M200 20 C280 60, 340 140, 340 200 C340 260, 280 340, 200 380 C120 340, 60 260, 60 200 C60 140, 120 60, 200 20Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="0.8"
        opacity="0.5"
      />
    </svg>
  );
}

function MyTeamLayer() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.05]">
      <svg viewBox="0 0 900 600" className="h-full w-full max-w-full" preserveAspectRatio="xMidYMid slice">
        {/* Pitch outline — premium tournament feel */}
        <rect x="80" y="60" width="740" height="480" rx="24" fill="none" stroke="#00C853" strokeWidth="2" />
        <line x1="450" y1="60" x2="450" y2="540" stroke="#00C853" strokeWidth="1.5" opacity="0.6" />
        <circle cx="450" cy="300" r="70" fill="none" stroke="#00C853" strokeWidth="1.5" opacity="0.6" />
        {/* Ball-inspired arcs over pitch */}
        <path
          d="M200 100 C350 40, 550 40, 700 100"
          fill="none"
          stroke="#0066FF"
          strokeWidth="3"
        />
        <path
          d="M150 500 C350 560, 550 560, 750 500"
          fill="none"
          stroke="#E53935"
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}

function PredictionsLayer() {
  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.08]"
        preserveAspectRatio="none"
        viewBox="0 0 1000 800"
      >
        <path
          d="M-100 700 C200 500, 400 300, 700 100 L900 -50"
          fill="none"
          stroke="#0066FF"
          strokeWidth="80"
          strokeLinecap="round"
        />
        <path
          d="M-50 750 C250 550, 450 350, 750 150 L950 0"
          fill="none"
          stroke="#0052CC"
          strokeWidth="40"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M1100 100 C800 300, 600 500, 300 700 L100 850"
          fill="none"
          stroke="#E53935"
          strokeWidth="60"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </>
  );
}

function BetsLayer() {
  return (
    <svg
      className="animate-wc-ribbon-drift absolute right-0 top-1/4 h-[60vh] w-full max-w-[600px] opacity-[0.09]"
      viewBox="0 0 600 400"
    >
      <path
        d="M500 0 C580 100, 600 220, 520 340 C440 460, 280 480, 160 400 C40 320, 0 180, 60 80 C120 -20, 280 -40, 400 20 C460 50, 480 0, 500 0Z"
        fill="#E53935"
      />
      <path
        d="M420 60 C480 140, 490 240, 420 320 C350 400, 240 410, 160 350 C80 290, 60 190, 110 110 C160 30, 260 10, 340 50 C380 70, 400 40, 420 60Z"
        fill="#D62828"
        opacity="0.5"
      />
    </svg>
  );
}

function CalendarLayer() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07]"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Journey path connecting fixtures */}
      <path
        d="M50 450 C150 400, 250 420, 350 350 C450 280, 550 300, 650 230 C750 160, 850 180, 950 100"
        fill="none"
        stroke="#0066FF"
        strokeWidth="2"
        strokeDasharray="8 12"
      />
      <path
        d="M80 480 C200 430, 320 440, 440 370 C560 300, 680 320, 800 250"
        fill="none"
        stroke="#00C853"
        strokeWidth="1.5"
        strokeDasharray="6 10"
        opacity="0.7"
      />
      {[150, 350, 550, 750].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={400 - i * 60}
          r="6"
          fill={i % 2 === 0 ? "#0066FF" : "#00C853"}
          opacity="0.8"
        />
      ))}
      {/* Flowing ribbons */}
      <path
        d="M0 200 C200 150, 400 180, 600 120 C800 60, 900 80, 1000 40"
        fill="none"
        stroke="#0066FF"
        strokeWidth="30"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M0 520 C250 480, 500 500, 750 440 C900 400, 950 420, 1000 380"
        fill="none"
        stroke="#00C853"
        strokeWidth="25"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

function ProfileLayer() {
  return (
    <svg
      className="absolute left-1/2 top-0 h-[50vh] w-full -translate-x-1/2 opacity-[0.06]"
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMin slice"
    >
      <path
        d="M0 200 C200 80, 400 60, 600 100 C700 120, 750 140, 800 160 L800 0 L0 0Z"
        fill="#0066FF"
      />
      <path
        d="M0 220 C180 120, 380 100, 580 130 C680 145, 740 160, 800 175 L800 40 L0 40Z"
        fill="#0052CC"
        opacity="0.5"
      />
      <circle cx="400" cy="150" r="100" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
      <circle cx="400" cy="150" r="70" fill="none" stroke="#00C853" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function OwnerLayer() {
  return (
    <svg
      className="absolute right-[10%] top-[20%] h-[40vh] w-[40vw] opacity-[0.06]"
      viewBox="0 0 200 200"
    >
      <path
        d="M100 10 L130 70 L190 80 L145 125 L155 185 L100 155 L45 185 L55 125 L10 80 L70 70Z"
        fill="none"
        stroke="#0066FF"
        strokeWidth="1.5"
      />
    </svg>
  );
}
