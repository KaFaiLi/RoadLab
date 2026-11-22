import { scenes } from "../content/scenes";
function Pine({
  x,
  y,
  s = 1,
  color = "#244e49",
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-2 0v-12h-9l6-9h-4l6-10h-3l6-13 6 13H3l6 10H5l6 9H2V0z" />
    </g>
  );
}
export function HeroArt() {
  return (
    <svg
      className="hero-art"
      viewBox="0 0 620 335"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="cloudlines"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 6L6 0" stroke="#ead9a0" opacity=".22" />
        </pattern>
      </defs>
      <circle cx="405" cy="108" r="61" fill="#f3a373" />
      <circle
        cx="405"
        cy="108"
        r="75"
        stroke="#f9dba5"
        strokeDasharray="1 6"
        fill="none"
        opacity=".7"
      />
      <path
        fill="#9fbab0"
        d="m28 230 92-67 25 7 52-46 29 19 73-63 23 11 40-44 25-9 79 80 39-29 115 101v125H0z"
      />
      <path
        fill="#e6e7c9"
        d="m302 83 20 8 40-44 25-9 39 40-23-9-7 9-13-15-9 6-9-6-16 18-2-9-22 24z"
      />
      <path
        fill="#75998a"
        d="m0 218 99-45 63 16 84-19 80-50 51 17 52-30 52 25 71-15 68 27v200H0z"
      />
      <path
        fill="url(#cloudlines)"
        d="m285 150 92-13 52-30 52 25 71-15 68 27v16l-120-4-113 30z"
      />
      <path
        d="M0 225q110-30 185-15t177-22q121-49 258-22v169H0z"
        fill="#547a64"
      />
      {Array.from({ length: 33 }, (_, i) => (
        <Pine
          key={i}
          x={180 + i * 15}
          y={202 + Math.sin(i * 0.25) * 19}
          s={0.46 + (i % 5) * 0.09}
          color="#416a5d"
        />
      ))}
      <path
        d="M340 188q119 13 58 39t28 34q136 12 147 74H136q27-52 164-81 95-19 53-30-47-12-13-36"
        fill="#dae0ba"
      />
      <path
        d="M343 188q104 13 43 39t27 37q126 12 140 71H166q25-48 139-76 102-25 55-38-45-11-17-33"
        fill="#4b6362"
      />
      <path
        d="M342 189q88 13 31 39t15 38q91 19 22 69"
        fill="none"
        stroke="#efd89c"
        strokeWidth="2.8"
        strokeDasharray="15 10"
      />
      <path
        d="M0 230q124-8 213 32-77 14-122 73H0zm620-40q-117 27-156 57 95 11 156 73z"
        fill="#345c4c"
      />
      {[35, 83, 124, 503, 566, 606].map((x, i) => (
        <Pine key={x} x={x} y={249 + (i % 3) * 18} s={1 + (i % 3) * 0.32} />
      ))}
      <g transform="translate(470 193) rotate(4)">
        <path stroke="#c8c8ae" strokeWidth="5" d="M0 10v84" />
        <rect
          x="-20"
          y="-20"
          width="40"
          height="40"
          rx="3"
          transform="rotate(45)"
          fill="#f3c352"
          stroke="#243c39"
          strokeWidth="3"
        />
        <path
          d="M1 14c12-12-18-13-1-27m-7 2 8-5 2 9"
          fill="none"
          stroke="#293c36"
          strokeWidth="4"
        />
      </g>
      <g transform="translate(305 264) rotate(-8)">
        <ellipse cx="10" cy="20" rx="43" ry="6" fill="#334741" opacity=".55" />
        <path
          d="m-28 5 12-18 31-1 13 8 11 9 1 14-69 1-5-7z"
          fill="#e8bc78"
          stroke="#253f3c"
          strokeWidth="2"
        />
        <path d="m-20 3 9-13 17-1-1 13zm30-14 8 1 11 9-19 1z" fill="#425c60" />
        <path d="M-29 6 5 5l27-2 6 7-68 4z" fill="#f5d8a3" />
        <rect x="-26" y="10" width="8" height="3" fill="#b04432" />
        <rect x="0" y="8" width="8" height="3" fill="#b04432" />
        <ellipse cx="29" cy="15" rx="5" ry="7" fill="#233936" />
        <ellipse cx="-23" cy="18" rx="5" ry="6" fill="#233936" />
      </g>
    </svg>
  );
}
export function ModeArt({ mode }: { mode: string }) {
  return (
    <svg
      viewBox="0 0 260 112"
      aria-hidden="true"
      className={"mode-art " + mode}
    >
      <defs>
        <pattern
          id={"grid" + mode}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M14 0H0v14"
            fill="none"
            stroke="currentColor"
            opacity=".09"
          />
        </pattern>
      </defs>
      <rect width="260" height="112" fill={"url(#grid" + mode + ")"} />
      {mode === "learn" ? (
        <g transform="translate(126 55) rotate(-9)">
          <path d="M-29 -6v70M28 -3v66" stroke="#7a8981" strokeWidth="6" />
          <rect
            transform="translate(22 -8) rotate(45)"
            x="-20"
            y="-20"
            width="40"
            height="40"
            rx="4"
            fill="#f4c34e"
            stroke="#364c40"
            strokeWidth="2"
          />
          <path
            d="m21-22 1 26m-1-14 10-9"
            fill="none"
            stroke="#344b40"
            strokeWidth="4"
          />
          <path
            d="M-60-27h62l-30 50z"
            stroke="#ba4e3d"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="#e76750"
          />
          <path
            d="M-55-24h51l-25 41z"
            fill="none"
            stroke="#fff1dc"
            strokeWidth="1.8"
          />
          <text
            x="-29"
            y="-6"
            textAnchor="middle"
            fill="white"
            fontWeight="bold"
            fontSize="10"
          >
            止まれ
          </text>
        </g>
      ) : mode === "quiz" ? (
        <g transform="translate(130 56) rotate(10)">
          <rect
            x="-34"
            y="-37"
            width="70"
            height="88"
            rx="6"
            fill="#789b8c"
            stroke="#355749"
            strokeWidth="2"
          />
          <rect x="-27" y="-30" width="56" height="72" rx="2" fill="#fff7df" />
          <rect x="-16" y="-40" width="33" height="12" rx="4" fill="#3f6754" />
          {[-13, 3, 19].map((y) => (
            <g key={y}>
              <path
                d={`M-18 ${y}l3 3 6-7M-4 ${y}h24`}
                fill="none"
                stroke="#739483"
                strokeWidth="2.5"
              />
            </g>
          ))}
          <path
            d="m36 20 14-51 6 2-15 51-5 7z"
            fill="#ce8544"
            stroke="#725533"
          />
        </g>
      ) : (
        <g>
          <path
            d="M0 108 80 47l30 19 38-41 43 45 24-19 45 40v21H0z"
            fill="#b8c8cf"
          />
          <path d="m0 101 72-25 58 5 55-12 75 20v23H0z" fill="#789894" />
          <path
            d="M119 76q53 3 24 13t30 23H76q10-8 42-16t1-20"
            fill="#505e65"
          />
          <path
            d="M123 77q41 3 11 13t-6 22"
            fill="none"
            stroke="#f1e0a1"
            strokeDasharray="6 4"
          />
          <Pine x={180} y={96} s={1.1} />
          <Pine x={66} y={93} s={0.7} />
          <circle cx="92" cy="30" r="12" fill="#edba83" />
        </g>
      )}
    </svg>
  );
}
export function Scene({ id, label }: { id: string; label: string }) {
  const s = scenes[id];
  if (!s) return null;
  const snowy = s.weather !== "clear";
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 600 225"
      className="road-scene"
    >
      <rect
        width="600"
        height="225"
        fill={s.daylight === "dusk" ? "#cfccbd" : "#c7dcd6"}
      />
      <path
        d="m0 100 110-65 71 36 69-48 110 60 68-37 172 60v119H0z"
        fill={snowy ? "#edf2ec" : "#91af98"}
      />
      <rect
        y="94"
        width="600"
        height="131"
        fill={snowy ? "#ecf1ec" : "#aabd94"}
      />
      {[26, 98, 513, 560].map((x, i) => (
        <Pine key={x} x={x} y={108 + (i % 2) * 8} s={0.8} />
      ))}
      <path d="M266 90h69l185 135H77z" fill={snowy ? "#93a3a7" : "#596565"} />
      {s.road === "junction" && <path d="M0 113h600v22H0z" fill="#596565" />}
      <path
        d="m300 94 6 131"
        stroke="#e9d394"
        strokeWidth="3"
        strokeDasharray="11 8"
      />
      {s.feature === "crossing" &&
        Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`m${213 + i * 18} 133 11 0 3 8h-15z`}
            fill="#f7f5e4"
          />
        ))}
      {["stop", "signal", "crossing", "rail"].includes(s.feature ?? "") && (
        <path d="m174 161 126 0" stroke="white" strokeWidth="5" />
      )}
      {s.feature === "stop" && (
        <g>
          <path d="M179 104v38" stroke="#596565" strokeWidth="4" />
          <image
            href={import.meta.env.BASE_URL + "assets/signs/stop.png"}
            x="157"
            y="70"
            width="44"
            height="40"
          />
        </g>
      )}
      {s.feature === "rail" && (
        <g>
          <path d="M0 123h600m-600 8h600" stroke="#554d47" strokeWidth="3" />
          <path
            d="M189 143V75m-12 4 24 18m-24 0 24-18"
            stroke="#493f38"
            strokeWidth="6"
          />
          <path
            d="m177 79 24 18m-24 0 24-18"
            stroke="#f9c44c"
            strokeWidth="3"
          />
        </g>
      )}
      {s.feature === "signal" && (
        <g>
          <path
            d="M190 133V62h79"
            stroke="#637375"
            fill="none"
            strokeWidth="4"
          />
          <rect x="243" y="54" width="48" height="17" rx="7" fill="#32423e" />
          {["#586f67", "#63716a", "#ff6953"].map((c, i) => (
            <circle key={c} cx={252 + i * 15} cy="62" r="5" fill={c} />
          ))}
        </g>
      )}
      {s.road === "multi" && (
        <g stroke="white" fill="none" strokeWidth="3">
          <path d="m278 96-57 129" strokeDasharray="8 6" />
          <path d="m196 165 17-20m-11 4 12-6-1 12m49 10 7-16 12-3-5-4m5 4-6 5" />
        </g>
      )}
      {s.actors.includes("pedestrian") && (
        <g transform="translate(201 132)" stroke="#344d47" strokeWidth="4">
          <circle cy="-16" r="4" fill="#ba835d" stroke="none" />
          <path d="M0-12v9m0 0-4 8m4-8 4 8m-4-13 7 2" />
        </g>
      )}
      {s.actors.includes("car") && (
        <g transform="translate(225 187)">
          <ellipse cy="16" rx="28" ry="5" fill="#344a46" opacity=".4" />
          <path
            d="m-25 1 7-16h32l8 15 3 3v12h-51z"
            fill="#d59a61"
            stroke="#46514a"
            strokeWidth="2"
          />
          <path d="m-16-3 4-9h23l4 9z" fill="#466067" />
          <path d="M-22 6h7m27 0h8" stroke="#a94d34" strokeWidth="4" />
          <path d="M-21 15v5m40-5v5" stroke="#2d3736" strokeWidth="6" />
        </g>
      )}
      {s.actors.includes("bicycle") && (
        <g fill="none" stroke="#315549" strokeWidth="2">
          <circle cx="155" cy="151" r="7" />
          <circle cx="177" cy="151" r="7" />
          <path d="m155 151 8-12 14 12h-22" />
        </g>
      )}
      {s.actors.includes("obstacle") && (
        <path d="m153 158 8-20 8 20z" fill="#dd754a" />
      )}
      {s.weather === "ice" && (
        <path
          d="m180 174 61-13 27 2-69 16zm142 19 62-13 21 7-69 12z"
          fill="#ccdfe0"
          opacity=".7"
        />
      )}
      {s.weather === "snow" &&
        Array.from({ length: 60 }, (_, i) => (
          <path
            key={i}
            d={`m${(i * 83) % 600} ${(i * 47) % 225} 12-4`}
            stroke="white"
            opacity=".8"
            strokeWidth="2"
          />
        ))}
    </svg>
  );
}
