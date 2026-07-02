# TrBlazeUI — Claude Code session memory

## Required reading before any code change
ALWAYS read and follow:
- **docs/TrBlazeUI-Coding-Standards.md** — strict compliance for every line of code you write or modify.
- **docs/TrBlazeUI-Architecture.md** — respect module boundaries (Primitives → Components → Icons → Demos).
- **PROJECT-STATUS.md** — for current phase & next-step context.

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

Always reference REQ IDs in commit messages: `[REQ-UI-007] fix toolbar toggle state`.

## Verification
After every implementation phase, the verifier runs and writes per-REQ verdicts into the
owning checklist's Requirements Status table (`docs/TrBlazeUI-Checklist.md` — the single
source of truth — no dated docs/qa files). PROJECT-STATUS.md is updated after EVERY phase.
Library/consumer issues are tracked in the issue reports under `docs/` and resolved, never
silently worked around.

## Permissions and tool preference (read before using Bash)
Prefer the dedicated tools (Read, Edit, Write, Glob, Grep) over bash for file inspection and
editing — they are faster, diff-aware, and keep the transcript readable. Reserve Bash for
things that genuinely need a shell: `dotnet build`/`test`/`run` (via the Windows dotnet),
`./scripts/run-demo.sh`, git, etc.

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
