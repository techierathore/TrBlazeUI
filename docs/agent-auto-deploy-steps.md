# Implementation Guide: Auto-Deploy AI Skill Files via NuGet Build

**Session Date:** 2026-02-18
**Facilitator:** Mary (Business Analyst)
**Status:** Ready for Implementation

---

## Overview

Extend the existing `buildTransitive` mechanism in `TrBlazeUI.Components` to automatically deploy AI skill/command files into consuming projects' solution root. When a developer installs the NuGet package and builds, Claude Code and OpenCode skill files are copied to their respective command directories.

### Current State

- `TrBlazeUI-AI-Reference.md` is packed into the NuGet package under `docs/`
- A `buildTransitive` target auto-extracts it to `.trblazeui/` in the project directory
- Skill files exist at `docs/skills/claude-code-trblazeui.md` and `docs/skills/opencode-trblazeui.md` but are NOT deployed automatically

### Target State

On every build of a consuming project:
1. AI reference doc extracted to `{ProjectDir}/.trblazeui/` (existing, fix stale-copy bug)
2. Claude Code skill deployed to `{SolutionRoot}/.claude/commands/trblazeui.md` (NEW)
3. OpenCode skill deployed to `{SolutionRoot}/.opencode/commands/trblazeui.md` (NEW)

---

## Implementation Steps

### Step 1: Modify `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj`

**What:** Pack the skill files into the NuGet package so they're available for extraction.

**File:** `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj`

**Action:** Replace the existing `<ItemGroup>` that handles packing (the one with `README.md`, AI reference doc, and targets) with:

```xml
<ItemGroup>
  <None Include="README.md" Pack="true" PackagePath="\" />
  <!-- Pack AI reference doc for consuming projects -->
  <None Include="..\..\docs\TrBlazeUI-AI-Reference.md" Pack="true" PackagePath="docs\" />
  <!-- Pack AI skill files for consuming projects -->
  <None Include="..\..\docs\skills\claude-code-trblazeui.md" Pack="true" PackagePath="skills\" />
  <None Include="..\..\docs\skills\opencode-trblazeui.md" Pack="true" PackagePath="skills\" />
  <!-- Pack buildTransitive targets to auto-extract docs and deploy skills -->
  <None Include="build\TrBlazeUI.Components.targets" Pack="true" PackagePath="buildTransitive\" />
</ItemGroup>
```

**Changes from existing:**
- Added 2 new `<None>` entries for skill files, packed into `skills/` path in the NuGet package
- Everything else stays the same

---

### Step 2: Rewrite `src/TrBlazeUI.Components/build/TrBlazeUI.Components.targets`

**What:** Replace the entire targets file with an enhanced version that:
- Resolves the solution root directory
- Extracts AI docs (existing, with stale-copy bug fixed)
- Deploys skill files to `.claude/commands/` and `.opencode/commands/`
- Creates surgical `.gitignore` entries

**File:** `src/TrBlazeUI.Components/build/TrBlazeUI.Components.targets`

**Action:** Replace entire file content with:

```xml
<Project>

  <PropertyGroup>
    <!--
      Resolve solution/repo root for AI skill file deployment.
      Fallback chain:
        1. $(SolutionDir) - set when building from VS or 'dotnet build *.sln'
        2. Walk up to find Directory.Build.props (standard .NET solution root marker)
        3. Walk up to find .gitignore (common repo root marker)
        4. Fall back to project directory
    -->
    <_TrBlazeUISolutionRoot Condition="'$(SolutionDir)' != '' AND '$(SolutionDir)' != '*Undefined*'">$(SolutionDir)</_TrBlazeUISolutionRoot>
    <_TrBlazeUISolutionRoot Condition="'$(_TrBlazeUISolutionRoot)' == ''">$([MSBuild]::GetDirectoryNameOfFileAbove('$(MSBuildProjectDirectory)', 'Directory.Build.props'))</_TrBlazeUISolutionRoot>
    <_TrBlazeUISolutionRoot Condition="'$(_TrBlazeUISolutionRoot)' == ''">$([MSBuild]::GetDirectoryNameOfFileAbove('$(MSBuildProjectDirectory)', '.gitignore'))</_TrBlazeUISolutionRoot>
    <_TrBlazeUISolutionRoot Condition="'$(_TrBlazeUISolutionRoot)' == ''">$(MSBuildProjectDirectory)</_TrBlazeUISolutionRoot>
  </PropertyGroup>

  <!--
    Target: Extract AI Reference Documentation
    Deploys TrBlazeUI-AI-Reference.md to .trblazeui/ in the project directory.
    Always copies (SkipUnchangedFiles ensures efficiency). Updates on package upgrade.
  -->
  <Target Name="_ExtractTrBlazeUIAIDocs"
          AfterTargets="ResolvePackageAssets">
    <MakeDir Directories="$(MSBuildProjectDirectory)\.trblazeui" />
    <Copy SourceFiles="$(MSBuildThisFileDirectory)..\docs\TrBlazeUI-AI-Reference.md"
          DestinationFolder="$(MSBuildProjectDirectory)\.trblazeui"
          SkipUnchangedFiles="true" />
    <WriteLinesToFile File="$(MSBuildProjectDirectory)\.trblazeui\.gitignore"
                     Lines="*"
                     Overwrite="true"
                     Condition="!Exists('$(MSBuildProjectDirectory)\.trblazeui\.gitignore')" />
  </Target>

  <!--
    Target: Deploy AI Skill Files to Solution Root
    Copies Claude Code and OpenCode skill files to their respective command directories.
    Always copies (SkipUnchangedFiles ensures efficiency). Updates on package upgrade.
  -->
  <Target Name="_DeployTrBlazeUISkillFiles"
          AfterTargets="ResolvePackageAssets">

    <!-- Claude Code: .claude/commands/trblazeui.md -->
    <MakeDir Directories="$(_TrBlazeUISolutionRoot)\.claude\commands" />
    <Copy SourceFiles="$(MSBuildThisFileDirectory)..\skills\claude-code-trblazeui.md"
          DestinationFiles="$(_TrBlazeUISolutionRoot)\.claude\commands\trblazeui.md"
          SkipUnchangedFiles="true" />
    <WriteLinesToFile File="$(_TrBlazeUISolutionRoot)\.claude\commands\.gitignore"
                     Lines="trblazeui.md"
                     Overwrite="true"
                     Condition="!Exists('$(_TrBlazeUISolutionRoot)\.claude\commands\.gitignore')" />

    <!-- OpenCode: .opencode/commands/trblazeui.md -->
    <MakeDir Directories="$(_TrBlazeUISolutionRoot)\.opencode\commands" />
    <Copy SourceFiles="$(MSBuildThisFileDirectory)..\skills\opencode-trblazeui.md"
          DestinationFiles="$(_TrBlazeUISolutionRoot)\.opencode\commands\trblazeui.md"
          SkipUnchangedFiles="true" />
    <WriteLinesToFile File="$(_TrBlazeUISolutionRoot)\.opencode\commands\.gitignore"
                     Lines="trblazeui.md"
                     Overwrite="true"
                     Condition="!Exists('$(_TrBlazeUISolutionRoot)\.opencode\commands\.gitignore')" />

    <Message Text="TrBlazeUI: AI skill files deployed to $(_TrBlazeUISolutionRoot)" Importance="normal" />
  </Target>

</Project>
```

---

### Step 3: Verify Source Skill Files Exist

**What:** Confirm the source skill files are in place and contain the correct content.

**Files to verify:**
- `docs/skills/claude-code-trblazeui.md` -- Claude Code skill (already exists)
- `docs/skills/opencode-trblazeui.md` -- OpenCode skill (already exists)

**No action needed** -- these files already exist in the repository.

---

## Design Decisions & Rationale

### Solution Root Resolution Strategy

Uses a 4-step fallback chain (pure MSBuild built-in functions, no custom tasks):

| Priority | Method | When It Works |
|----------|--------|---------------|
| 1 | `$(SolutionDir)` | Building from Visual Studio or `dotnet build *.sln` |
| 2 | Walk up to `Directory.Build.props` | Standard .NET projects (99%+ have this at solution root) |
| 3 | Walk up to `.gitignore` | Git repos without `Directory.Build.props` |
| 4 | Project directory fallback | Standalone projects with no solution structure |

### Always-Overwrite with SkipUnchangedFiles

- **Previous behavior:** `Condition="!Exists(...)"` -- only copies once, never updates on package upgrade (BUG)
- **New behavior:** No existence condition, `SkipUnchangedFiles="true"` -- always runs but only performs I/O when content changes
- **Benefit:** Package upgrades automatically propagate updated skill files and AI docs

### Surgical Gitignore

- `.claude/commands/.gitignore` contains only `trblazeui.md`
- `.opencode/commands/.gitignore` contains only `trblazeui.md`
- User's own command files in these directories are NOT affected
- Gitignore is only created if it doesn't exist (won't overwrite user's custom gitignore)

### Multi-Project Solutions

If multiple projects in a solution reference `TrBlazeUI.Components`, the target runs for each project. Since they all resolve to the same solution root, `SkipUnchangedFiles="true"` ensures only the first build performs the copy.

---

## NuGet Package Structure (After Changes)

```
TrBlazeUI.Components.nupkg
├── TrBlazeUI.Components.nuspec
├── README.md
├── lib/
│   └── net10.0/
│       └── TrBlazeUI.Components.dll
├── docs/
│   └── TrBlazeUI-AI-Reference.md          ← AI reference (existing)
├── skills/
│   ├── claude-code-trblazeui.md            ← Claude Code skill (NEW)
│   └── opencode-trblazeui.md               ← OpenCode skill (NEW)
├── buildTransitive/
│   └── TrBlazeUI.Components.targets        ← Auto-deploy target (MODIFIED)
└── staticwebassets/
    └── ...
```

## Consuming Project After Build

```
ConsumingApp/
├── ConsumingApp.sln
├── Directory.Build.props
├── .claude/
│   └── commands/
│       ├── .gitignore                      ← contains "trblazeui.md"
│       └── trblazeui.md                    ← AUTO-DEPLOYED from NuGet
├── .opencode/
│   └── commands/
│       ├── .gitignore                      ← contains "trblazeui.md"
│       └── trblazeui.md                    ← AUTO-DEPLOYED from NuGet
└── src/
    └── ConsumingApp.Web/
        ├── ConsumingApp.Web.csproj
        └── .trblazeui/
            ├── .gitignore                  ← contains "*"
            └── TrBlazeUI-AI-Reference.md   ← AUTO-EXTRACTED from NuGet
```

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj` | **MODIFY** | Add 2 `<None>` entries to pack skill files into `skills/` |
| `src/TrBlazeUI.Components/build/TrBlazeUI.Components.targets` | **REPLACE** | Rewrite with solution root resolution + skill deployment + stale-copy fix |

**Total: 2 files modified, 0 files created.**

---

## Verification Steps

After implementation, verify by:

1. **Build the Components project** with `-p:CI=true` to ensure targets file is valid XML
2. **Pack the NuGet package** and inspect contents to verify `skills/` folder is included
3. **Create a test consuming project** with a solution file, reference the local NuGet package, build, and verify:
   - `.trblazeui/TrBlazeUI-AI-Reference.md` is extracted in the project directory
   - `.claude/commands/trblazeui.md` is deployed at solution root
   - `.opencode/commands/trblazeui.md` is deployed at solution root
   - `.gitignore` files are created with correct content
4. **Build again** to verify `SkipUnchangedFiles` prevents redundant copies
5. **Modify a skill file, re-pack, re-build** to verify updates propagate

---

*Session facilitated using the BMAD-METHOD brainstorming framework*
