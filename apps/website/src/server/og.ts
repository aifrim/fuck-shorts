import { Resvg } from "@cf-wasm/resvg";
import { satori } from "@cf-wasm/satori";
import {
  pickRandomOgCopy,
  SITE_TITLE,
  SITE_URL,
  type OgVoiceCopy,
  type TextHighlight,
  type TextSeg,
} from "@fuck-shorts/i18n";

// Astro Cloudflare treats `.bin` imports as ArrayBuffer (bundled into the Worker).
// Files are produced by `pnpm fonts:og` (predev / prebuild / pretest) — gitignored.
import syne800 from "./assets/syne-latin-800-normal.bin";
import plex500 from "./assets/ibm-plex-sans-latin-500-normal.bin";
import plex700 from "./assets/ibm-plex-sans-latin-700-normal.bin";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const paper = "#f3efe4";
const ink = "#14201b";
const moss = "#1f6f4a";
const mossDeep = "#0f3d2a";
const ember = "#c44b16";
// Match petition letter Tailwind tokens (PetitionLetter highlights).
const raspberry = "#c43d5a";
const vomit = "#6e7612";
const inkBlue = "#1e4d7a";
const bodyMuted = "rgba(20, 32, 27, 0.78)";

// Pre-mixed stops matching global.css page-atmosphere__gradient (no color-mix in satori).
const washMid = "#e4e7db";
const washMoss = "#e2e5d8";
const washEnd = "#f6f1e6";

/** Same grain SVG as `.page-atmosphere__noise` on the site. */
const NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E";

// Re-export OG copy types for callers that imported them from this module.
export type { OgVoiceCopy, TextHighlight, TextSeg };
export type OgHighlight = TextHighlight;
export type OgSeg = TextSeg;
export { pickRandomOgCopy };

/** Map letter highlight roles → satori span styles. */
function highlightStyle(
  highlight: OgHighlight | undefined,
): Record<string, string | number> {
  if (highlight === "vomit") {
    return { color: vomit, fontWeight: 700 };
  }

  if (highlight === "demand") {
    return {
      color: inkBlue,
      fontWeight: 700,
      textDecoration: "underline",
      textDecorationColor: inkBlue,
      textDecorationThickness: "3px",
    };
  }

  if (highlight === "ink") {
    return { color: ink, fontWeight: 700 };
  }

  if (highlight === "love") {
    return {
      color: raspberry,
      fontWeight: 700,
    };
  }

  return {
    color: bodyMuted,
    fontWeight: 500,
  };
}

/**
 * Move leading spaces onto the previous span.
 * With `whiteSpace: pre-wrap`, a leading space on a wrapped flex-span indents the new line.
 */
function normalizeTaglineSpaces(segments: OgSeg[]): OgSeg[] {
  const out = segments.map((seg) => ({ ...seg, t: seg.t }));

  for (let i = 0; i < out.length; i++) {
    const seg = out[i]!;
    let leading = 0;

    while (leading < seg.t.length && seg.t[leading] === " ") {
      leading += 1;
    }

    if (leading === 0) continue;

    const spaces = seg.t.slice(0, leading);
    seg.t = seg.t.slice(leading);

    if (i > 0) {
      out[i - 1]!.t += spaces;
    }
  }

  return out;
}

function taglineChildren(segments: OgSeg[]) {
  return normalizeTaglineSpaces(segments).map((seg) => ({
    type: "span",
    props: {
      style: highlightStyle(seg.highlight),
      children: seg.t,
    },
  }));
}

type FontConfig = {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 700 | 800;
  style: "normal";
};

/** Font bytes are static `.bin` imports — no Node fs / require in the Worker. */
function loadFonts(): FontConfig[] {
  return [
    {
      name: "Syne",
      data: syne800,
      weight: 800,
      style: "normal",
    },
    {
      name: "IBM Plex Sans",
      data: plex500,
      weight: 500,
      style: "normal",
    },
    {
      name: "IBM Plex Sans",
      data: plex700,
      weight: 700,
      style: "normal",
    },
  ];
}

/** Soft blurred orbs — same palette / placement idea as `.page-atmosphere__orb--*`. */
function atmosphereOrb(opts: { top: number; left: number; size: number; color: string }) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: opts.top,
        left: opts.left,
        width: opts.size,
        height: opts.size,
        borderRadius: "50%",
        backgroundColor: opts.color,
        filter: "blur(56px)",
      },
    },
  };
}

/** Site page atmosphere: wash + orbs + grain (static frame for OG). */
function atmosphereLayers() {
  return [
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          backgroundImage: [
            "radial-gradient(ellipse 90% 55% at 12% -10%, rgba(215,224,212,0.7) 0%, transparent 58%)",
            "radial-gradient(ellipse 70% 45% at 92% 8%, rgba(31,111,74,0.12) 0%, transparent 55%)",
            `linear-gradient(165deg, ${paper} 0%, ${washMid} 42%, ${washMoss} 72%, ${washEnd} 100%)`,
          ].join(", "),
        },
      },
    },
    // Positions scaled from the 1200×630 canvas (mirrors CSS % / rem sizes).
    atmosphereOrb({
      top: -50,
      left: -72,
      size: 420,
      color: "rgba(31,111,74,0.22)",
    }),
    atmosphereOrb({
      top: 113,
      left: 960,
      size: 360,
      color: "rgba(196,75,22,0.16)",
    }),
    atmosphereOrb({
      top: 100,
      left: 216,
      size: 480,
      color: "rgba(30,77,122,0.14)",
    }),
    atmosphereOrb({
      top: 418,
      left: 816,
      size: 288,
      color: "rgba(196,61,90,0.12)",
    }),
    {
      type: "img",
      props: {
        src: NOISE_DATA_URI,
        width: OG_WIDTH,
        height: OG_HEIGHT,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          opacity: 0.28,
          objectFit: "cover",
        },
      },
    },
  ];
}

/** Satori tree for the OG card. */
export function ogMarkup(count: number, copy: OgVoiceCopy = pickRandomOgCopy()) {
  const signedLabel =
    count === 1 ? "1 signed" : `${count.toLocaleString("en-US")} signed`;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: paper,
        fontFamily: "IBM Plex Sans",
        color: ink,
      },
      children: [
        ...atmosphereLayers(),
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              padding: "56px 64px 48px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "28px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "36px",
                                height: "6px",
                                backgroundColor: ember,
                                borderRadius: "2px",
                              },
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                fontFamily: "Syne",
                                fontSize: "16px",
                                fontWeight: 800,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: moss,
                              },
                              children: copy.eyebrow,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontFamily: "Syne",
                          fontSize: "108px",
                          fontWeight: 800,
                          lineHeight: 0.92,
                          letterSpacing: "-0.04em",
                          color: ink,
                          whiteSpace: "nowrap",
                        },
                        children: SITE_TITLE,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexWrap: "wrap",
                          // Satori flex-spans trim edge spaces; keep them + allow wrap.
                          whiteSpace: "pre-wrap",
                          maxWidth: "900px",
                          fontSize: "34px",
                          lineHeight: 1.35,
                          color: bodyMuted,
                        },
                        children: taglineChildren(copy.tagline),
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontFamily: "Syne",
                          fontSize: "48px",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                          color: ink,
                        },
                        children: signedLabel,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: `2px solid ${mossDeep}22`,
                          paddingTop: "28px",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                fontFamily: "Syne",
                                fontSize: "28px",
                                fontWeight: 800,
                                color: mossDeep,
                              },
                              children: SITE_URL.startsWith("https://")
                                ? SITE_URL.slice("https://".length)
                                : SITE_URL,
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontFamily: "Syne",
                                fontSize: "22px",
                                fontWeight: 800,
                                color: ember,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                              },
                              children: "Sign the letter",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** SVG → PNG via Cloudflare-safe WASM (`@cf-wasm/resvg`). */
async function svgToPng(svg: string): Promise<Uint8Array> {
  const resvg = await Resvg.async(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  });

  return resvg.render().asPng();
}

/** Render OG PNG for the current signature tally (random voice each call). */
export async function renderOgPng(count: number): Promise<Uint8Array> {
  const fonts = loadFonts();
  const copy = pickRandomOgCopy();
  const svg = await satori(ogMarkup(count, copy), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  return svgToPng(svg);
}
