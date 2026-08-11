#!/usr/bin/env python3
"""Validate the shipped TrBlazeUI design tokens as a CONTRAST MATRIX.

Every foreground token is checked against every surface token the same theme ships - not just
against `--background`. A palette tuned against the page background alone passes its own audit and
still fails on the raised surfaces (`--muted`, `--secondary`, `--accent`, `--card`, `--popover`)
that the same stylesheet defines. `--input` is checked separately at the 3:1 threshold, because it
draws the visible boundary of every form control (WCAG 1.4.11 Non-text Contrast).

Usage:  python3 tools/token-contrast.py [path-to-input.css]
Exit code is non-zero if any required pairing fails.
"""

from __future__ import annotations

import math
import re
import sys

DEFAULT_CSS = "src/TrBlazeUI.Components/wwwroot/css/trblazeui-input.css"

# Foreground tokens that carry text, and the surfaces each one is expected to sit on.
TEXT_ON_SURFACES = {
    "foreground": ["background", "card", "popover", "muted", "secondary", "accent"],
    "muted-foreground": ["background", "card", "popover", "muted", "secondary", "accent"],
    "card-foreground": ["card", "background"],
    "popover-foreground": ["popover", "background"],
    "primary": ["background", "card", "popover", "muted", "secondary", "accent"],
    "destructive": ["background", "card", "popover", "muted", "secondary", "accent"],
    "success": ["background", "card", "popover", "muted", "secondary", "accent"],
    "alert-success-foreground": ["alert-success-bg", "background", "card"],
    "alert-info-foreground": ["alert-info-bg", "background", "card"],
    "alert-warning-foreground": ["alert-warning-bg", "background", "card"],
    "alert-danger-foreground": ["alert-danger-bg", "background", "card"],
    "primary-foreground": ["primary"],
    "secondary-foreground": ["secondary"],
    "accent-foreground": ["accent"],
    "destructive-foreground": ["destructive"],
    "sidebar-foreground": ["sidebar", "sidebar-accent"],
}

# Non-text tokens that must clear 3:1 (WCAG 1.4.11) against the surface they are drawn on.
NON_TEXT_ON_SURFACES = {
    "input": ["background", "card", "popover"],
    "ring": ["background", "card", "popover"],
}

TEXT_THRESHOLD = 4.5
NON_TEXT_THRESHOLD = 3.0


def oklch_to_srgb(aL: float, aC: float, aH: float) -> tuple[float, float, float]:
    """Converts an OKLCH colour to non-linear sRGB in the 0..1 range."""
    vHRad = math.radians(aH)
    vA = aC * math.cos(vHRad)
    vB = aC * math.sin(vHRad)

    vLms = (
        (aL + 0.3963377774 * vA + 0.2158037573 * vB) ** 3,
        (aL - 0.1055613458 * vA - 0.0638541728 * vB) ** 3,
        (aL - 0.0894841775 * vA - 1.2914855480 * vB) ** 3,
    )
    l, m, s = vLms

    vLinear = (
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )
    return tuple(max(0.0, min(1.0, v)) for v in vLinear)  # type: ignore[return-value]


def relative_luminance(aLinearRgb: tuple[float, float, float]) -> float:
    """Computes the WCAG relative luminance of a linear-light sRGB triple."""
    r, g, b = aLinearRgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(aFg: tuple[float, float, float], aBg: tuple[float, float, float]) -> float:
    """Computes the WCAG contrast ratio between two linear-light sRGB triples."""
    vL1 = relative_luminance(aFg)
    vL2 = relative_luminance(aBg)
    vHi, vLo = max(vL1, vL2), min(vL1, vL2)
    return (vHi + 0.05) / (vLo + 0.05)


OKLCH_RE = re.compile(
    r"oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*(?:/\s*([0-9.]+)%\s*)?\)", re.IGNORECASE
)
DECL_RE = re.compile(r"--([a-z0-9-]+)\s*:\s*([^;]+);", re.IGNORECASE)


def parse_blocks(aCss: str) -> dict[str, dict[str, str]]:
    """Extracts the :where(:root) and :where(.dark) token blocks from the input stylesheet."""
    vBlocks: dict[str, dict[str, str]] = {}
    for vName, vSelector in (("light", r":where\(:root\)"), ("dark", r":where\(\.dark\)")):
        vMatch = re.search(vSelector + r"\s*\{(.*?)\n\s*\}", aCss, re.DOTALL)
        if not vMatch:
            continue
        vBlocks[vName] = {m.group(1): m.group(2).strip() for m in DECL_RE.finditer(vMatch.group(1))}
    return vBlocks


def resolve(aTokens: dict[str, str], aName: str, aOver: tuple[float, float, float] | None = None):
    """Resolves a token to a linear-light sRGB triple, compositing any alpha over a backdrop."""
    vRaw = aTokens.get(aName)
    if not vRaw:
        return None
    vMatch = OKLCH_RE.search(vRaw)
    if not vMatch:
        return None
    vColor = oklch_to_srgb(float(vMatch.group(1)), float(vMatch.group(2)), float(vMatch.group(3)))
    vAlpha = float(vMatch.group(4)) / 100.0 if vMatch.group(4) else 1.0
    if vAlpha < 1.0 and aOver is not None:
        vColor = tuple(vAlpha * c + (1 - vAlpha) * b for c, b in zip(vColor, aOver))  # type: ignore[assignment]
    return vColor


def main() -> int:
    vPath = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CSS
    with open(vPath, encoding="utf-8") as fh:
        vCss = fh.read()

    vBlocks = parse_blocks(vCss)
    if not vBlocks:
        print(f"No :where(:root) / :where(.dark) token blocks found in {vPath}")
        return 2

    vFailures = 0
    for vMode, vTokens in vBlocks.items():
        print(f"\n=== {vMode} ===")
        for vPairs, vThreshold, vKind in (
            (TEXT_ON_SURFACES, TEXT_THRESHOLD, "text"),
            (NON_TEXT_ON_SURFACES, NON_TEXT_THRESHOLD, "non-text"),
        ):
            for vFg, vSurfaces in vPairs.items():
                for vBg in vSurfaces:
                    vBgColor = resolve(vTokens, vBg)
                    if vBgColor is None:
                        continue
                    vFgColor = resolve(vTokens, vFg, vBgColor)
                    if vFgColor is None:
                        continue
                    vRatio = contrast(vFgColor, vBgColor)
                    vOk = vRatio >= vThreshold
                    if not vOk:
                        vFailures += 1
                    print(f"  {'ok  ' if vOk else 'FAIL'} {vKind:8} --{vFg} on --{vBg}: {vRatio:.2f}:1"
                          f" (needs {vThreshold})")

    print(f"\n{vFailures} failing pairing(s).")
    return 1 if vFailures else 0


if __name__ == "__main__":
    sys.exit(main())
