/**
 * Global decorative background inspired by the World Cup 2026 ball aesthetic.
 * Fixed layers only — does not affect layout, navigation, or content structure.
 */
export function WorldCupBackground() {
  return (
    <div className="world-cup-background" aria-hidden="true">
      {/* Layer 2 — large flowing curves & ribbons */}
      <svg
        className="world-cup-shapes"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wc-blue-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="wc-red-arc" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E53935" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#E53935" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="wc-green-curve" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C853" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#00C853" stopOpacity="0.025" />
          </linearGradient>
          <linearGradient id="wc-blue-red-blend" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0066FF" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#E53935" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.02" />
          </linearGradient>
          <filter id="wc-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* Top left — blue curved ribbon */}
        <path
          className="world-cup-shape world-cup-shape--blue-tl"
          d="M-120 -80 C 80 40, 220 180, 380 120 S 620 -20, 520 -160 S 180 -280, -120 -80 Z"
          fill="url(#wc-blue-ribbon)"
          filter="url(#wc-soft-blur)"
        />
        <path
          className="world-cup-shape world-cup-shape--blue-tl-inner"
          d="M-60 20 C 120 100, 260 200, 340 160 S 480 60, 420 -40"
          fill="none"
          stroke="#0066FF"
          strokeWidth="48"
          strokeLinecap="round"
          strokeOpacity="0.04"
        />

        {/* Top right — red flowing arc */}
        <path
          className="world-cup-shape world-cup-shape--red-tr"
          d="M1560 40 C 1340 120, 1180 280, 1020 220 S 760 80, 880 -60 S 1240 -120, 1560 40 Z"
          fill="url(#wc-red-arc)"
          filter="url(#wc-soft-blur)"
        />
        <path
          className="world-cup-shape world-cup-shape--red-tr-inner"
          d="M1500 100 C 1320 180, 1140 300, 980 260 S 820 140, 900 40"
          fill="none"
          stroke="#E53935"
          strokeWidth="42"
          strokeLinecap="round"
          strokeOpacity="0.045"
        />

        {/* Bottom left — green curved shape */}
        <path
          className="world-cup-shape world-cup-shape--green-bl"
          d="M-80 920 C 100 780, 280 680, 420 740 S 640 920, 500 1040 S 120 1080, -80 920 Z"
          fill="url(#wc-green-curve)"
          filter="url(#wc-soft-blur)"
        />
        <ellipse
          className="world-cup-shape world-cup-shape--green-bl-arc"
          cx="280"
          cy="880"
          rx="220"
          ry="140"
          fill="none"
          stroke="#00C853"
          strokeWidth="36"
          strokeOpacity="0.035"
        />

        {/* Bottom right — blue & red curve combination */}
        <path
          className="world-cup-shape world-cup-shape--blend-br"
          d="M1560 860 C 1380 720, 1200 640, 1040 700 S 780 880, 900 980 S 1280 1040, 1560 860 Z"
          fill="url(#wc-blue-red-blend)"
          filter="url(#wc-soft-blur)"
        />
        <path
          className="world-cup-shape world-cup-shape--blue-br"
          d="M1480 820 C 1300 700, 1120 620, 1000 680"
          fill="none"
          stroke="#0066FF"
          strokeWidth="40"
          strokeLinecap="round"
          strokeOpacity="0.04"
        />
        <path
          className="world-cup-shape world-cup-shape--red-br"
          d="M1540 900 C 1360 780, 1180 720, 1060 780"
          fill="none"
          stroke="#E53935"
          strokeWidth="34"
          strokeLinecap="round"
          strokeOpacity="0.035"
        />
      </svg>

      {/* Layer 3 — subtle ball-panel patterns */}
      <svg
        className="world-cup-patterns"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="wc-panel-arcs"
            width="360"
            height="360"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 180 A 90 90 0 0 1 180 0"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1"
              strokeOpacity="0.04"
            />
            <path
              d="M180 360 A 90 90 0 0 1 360 180"
              fill="none"
              stroke="#E53935"
              strokeWidth="1"
              strokeOpacity="0.035"
            />
            <path
              d="M90 270 A 60 60 0 0 1 180 180"
              fill="none"
              stroke="#00C853"
              strokeWidth="1"
              strokeOpacity="0.03"
            />
          </pattern>
          <pattern
            id="wc-contour-lines"
            width="480"
            height="480"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 240 Q 120 180, 240 240 T 480 240"
              fill="none"
              stroke="#0066FF"
              strokeWidth="0.75"
              strokeOpacity="0.025"
            />
            <path
              d="M0 320 Q 160 260, 320 320 T 640 320"
              fill="none"
              stroke="#E53935"
              strokeWidth="0.75"
              strokeOpacity="0.02"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wc-panel-arcs)" />
        <rect width="100%" height="100%" fill="url(#wc-contour-lines)" />
      </svg>

      {/* Layer 4 — soft ambient blur orbs */}
      <div className="world-cup-blur world-cup-blur--blue" />
      <div className="world-cup-blur world-cup-blur--red" />
      <div className="world-cup-blur world-cup-blur--green" />
    </div>
  );
}
