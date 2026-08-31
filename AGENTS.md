# TrBlazeUI — project session memory (all harnesses)

<!-- This file is COMMITTED (unlike CLAUDE.md, which is gitignored and imports it).
     OpenCode and Codex auto-load AGENTS.md; Claude Code loads it through CLAUDE.md's
     @AGENTS.md import. Keep everything in here harness-neutral — Claude-only
     material (permissions, tool preference) lives in CLAUDE.md.
     Split 2026-08-27 from a pre-2026-08-20 full-content CLAUDE.md; every project
     section was carried over verbatim. The pre-split original is kept at
     .claude/CLAUDE.md.pre-split.bak. -->

## Required reading before any code change

ALWAYS read and follow:
- **docs/TrBlazeUI-Coding-Standards.md** — strict compliance for every line of code you write or modify.
- **docs/TrBlazeUI-Architecture.md** — respect module boundaries (Primitives → Components → Icons → Demos).
- **PROJECT-STATUS.md** — for current phase & next-step context.

## Hard rules (non-negotiable — the harness enforces #1)

1. **Git is manual — agents NEVER run `git` or `gh`.** Not to commit, and not to read (`status`/`log`/`diff`/`grep`/`blame`). All harnesses enforce this mechanically: Claude Code via `.claude/settings.json` and `block-git.sh`; OpenCode via `opencode.jsonc` plus its plugin bridge; Codex via `.codex/rules/techieflow.rules` plus `.codex/hooks.json`. A blocked git call is the policy working, not an obstacle to route around. Evidence for status updates / "what changed" = the checklist Requirements Status table + the working-tree files (+ mtimes) + a fresh `dotnet build` (`.tfcore/tasks/_status-update-gate.md`). The OWNER commits, in a separate terminal.
2. **Run the app yourself — the test harness is fully set up.** Headless Playwright + Chromium live in WSL; the Windows/MAUI dotnet bridge is rung #4 of the build ladder; MAUI Android/iOS/Mac Catalyst are driven over the Appium bridge (`core-config.yaml → runtimeVerification.appium`). NEVER ask the owner to boot the app, run a build, or execute a command — "can't run on Linux/WSL", "it targets Windows", "it's MAUI", "Playwright needs a GUI", "the dependent service is down" are BANNED excuses (`.tfcore/tasks/_smoke-test-policy.md`). Asking the owner is the LAST resort, only after the build ladder + `verify-phase §3a` escalation genuinely fail — and even then you still run the test yourself once they reply.
3. **The framework tree is invisible to search — a search that finds nothing is NOT proof a file is missing.** `.tfcore/`, `.claude/`, `.codex/`, `.opencode/` and `.agents/skills/` are hidden dot-directories AND gitignored here (deliberate — deployed framework copies are never committed). File search skips hidden paths *and* honours `.gitignore`, so it takes **both** (`rg -uu`; `--hidden` alone is not enough), and `git grep`/`git ls-files` see nothing at all. Confirm a framework file by **reading its literal path** — every one has a single canonical location, and whatever needs it names that path. Never write "not present in this tree" into a verdict, a checklist Remarks cell, a BRD row, or a blocker without having tried the path and failed: that false negative propagates into the docs and the next agent treats it as fact. If a framework file really is absent, the repo needs `update-framework.sh <repo>` run once on this machine — report that instead of reimplementing what it does. (`.tfcore/tasks/_status-update-gate.md` §"The framework tree is INVISIBLE to search".)
4. **Native-head automation binds to the app's own window.** Drive a MAUI head only through a session attached to the app under test (Windows: launched PID → its top-level window handle; Android/iOS/Catalyst: the app's package/bundle id), interact element-by-element via `AutomationId`, and NEVER inject global keyboard/mouse input — it lands in whatever window happens to have focus, not the app (`verify-phase.md §3b`).

## Project basics

- TrBlazeUI is a **Blazor UI component library** (not an app): 16 headless primitives, ~69 styled components, 3 icon packages, demos in Server/WASM/Auto. No backend, DB, auth, or RAG.
- Stack: .NET 10, C# 14, Blazor (Server/WASM/Auto), Tailwind CSS v4 (pre-built CSS shipped).
- **Field-prefix convention: `obj` prefix on instance fields** (e.g. `private readonly ILogger<X> objLogger;`) — this project's pinned day-1 decision; recorded in Coding Standards §"Fields, Parameters, Locals", which is authoritative. Parameters use `a` prefix, locals use `v` prefix.
- Test naming: short PascalCase, NO underscores. Full scenario in XML `<summary>` doc.

## IMPORTANT build/repo rules

- **Never commit to git unless explicitly instructed.**
- **This application does NOT support hot-reload** — build and restart to test changes.
- Build environment is WSL-on-Windows: use the Windows dotnet via `cmd.exe /c "dotnet build TrBlazeUI.sln -c Release -p:CI=true"` (rung #4 of the build-invocation ladder). `-p:CI=true` skips the Tailwind step (pre-built CSS is committed).
- `TreatWarningsAsErrors` + `EnforceCodeStyleInBuild` are ON — analyzer warnings (incl. IDE####) fail the build. Apache 2.0; the NOTICE file must ship with any distribution.

## Requirement ID prefixes used in this repo

- `REQ-UI-*` — UI/component work, routed to /trblazeui
- `REQ-FN-*` — build/CI/packaging/skills, routed to /flow-master
- `REQ-NFR-*` — non-functional
- (No `REQ-RAG-*` — the library has no AI/RAG runtime.)

Always tag work with its REQ ID in the checklist's Requirements Status **Remarks** cell (e.g. `[REQ-UI-007] fix toolbar toggle state`). Agents never git-commit (Hard rule 1); the owner's own manual commits use the same `[REQ-*]` tags.

## Verification

After every implementation phase, the verifier runs and writes per-REQ verdicts into the
owning checklist's Requirements Status table (`docs/TrBlazeUI-Checklist.md` — the single
source of truth — no dated docs/qa files). PROJECT-STATUS.md is updated after EVERY phase.
Library/consumer issues are tracked in the issue reports under `docs/` and resolved, never
silently worked around.

## Slash-command syntax (READ ME if a `/agent *command` invocation fails)

TechieFlow-native agents register under `TechieFlow:agents:<name>`. Use the full form if the
short `/<agent>` form doesn't resolve:

| Agent | Claude Code | OpenCode |
|-------|-------------|----------|
| analyst | `/TechieFlow:agents:analyst` (or `/analyst`) | `/flow-analyst` |
| flow-master | `/TechieFlow:agents:flow-master` | `/flow-master` |
| verifier | `/TechieFlow:agents:verifier` | (add to opencode.jsonc) |
| trblazeui | `/trblazeui` | `/trblazeui` |

After the agent is loaded, every TechieFlow-native agent accepts `*command args` style
invocations. `/trblazeui` is a free-form persona for generating UIs with this library.

## DevFlow (legacy)

This repo previously used DevFlow (`.devflow/instructions.md`); day-1 docs are now produced
by TechieFlow. The prior CLAUDE.md is archived at `docs/OldDocs/CLAUDE.md`.
