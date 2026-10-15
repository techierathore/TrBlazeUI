# TrBlazeUI — CI / release pipeline issues

Pipeline defects reported from a GitHub Actions run log, as opposed to the consumer feedback
files (`docs/<Consumer>-TrBlazeUI-Feedback.md`) and the component issue reports. One dated entry
per report, newest first, with the log as it was handed over.

---

## CI-002 — restore fails on new ASP.NET Core advisories against the demos' 10.0.3 packages (2026-10-15)

**Reported by:** the owner, from run [38773955449](https://github.com/techierathore/TrBlazeUI/actions/runs/38773955449) (Build Validation, `Dev`, `ce677f4`).
**Workflow:** `.github/workflows/build.yml`, step *Restore dependencies*; *Build solution* was skipped.

### Reproduced

`bash .tfcore/utils/tf-ci-repro.sh .github/workflows/build.yml` on a clean copy with empty caches:

```
error NU1903: Warning As Error: Package 'Microsoft.AspNetCore.Components.WebAssembly.Server' 10.0.3
has a known high severity vulnerability, https://github.com/advisories/GHSA-g27p-qf6j-c96c
```

The same for GHSA-qjpx-jqm5-h2c4. Both advisories were published on 2026-10-13 and cover 10.0.0
to 10.0.12; 10.0.13 is patched.

### Root cause

The demo projects pinned the ASP.NET Core packages at 10.0.3. `TreatWarningsAsErrors` turns
NuGet's audit warning NU1903 into an error. The local build stayed green because its restore used
advisory data the machine had cached before 2026-10-13.

### Fixed

- The demos' `Microsoft.AspNetCore.Components.*` packages (`WebAssembly.Server`, `WebAssembly`,
  `WebAssembly.DevServer`, `Web`) move to 10.0.13 together. The five library packages keep their
  10.0.3 minimum: they never reference `WebAssembly.Server`, and the consumer's own app picks its
  ASP.NET Core version.
- `tests/verify/req-fn.spec.ts` gains a REQ-NFR-005 test that runs
  `dotnet list TrBlazeUI.sln package --vulnerable --include-transitive` with an empty NuGet HTTP
  cache. A local run now reads today's advisories, the way a fresh runner does.
- `tf-ci-repro.sh` passes on empty caches: restore, then a Release build with 0 warnings. The
  owner's next push is the final check.

---

## CI-001 — a release tag with any prefix other than `v` kills the publish (2026-09-12)

**Reported by:** the owner, from the failed Actions run.
**Workflow:** `.github/workflows/publish-github-packages.yml`, step *Determine package version*.
**Tag:** `c2.0.5` (a stray `c` where `v2.0.5` was meant).
**Rows:** REQ-FN-005 (tag → version resolution), REQ-FN-004 (the publish path that shares it).

### The log, as handed over

```text
$source = "Directory.Build.props"
Release tag: c2.0.5 -> version: c2.0.5
Exception: D:\a\_temp\df294226-435e-4df1-a5a8-40644950c219.ps1:25
Line |
  25 |    throw "Invalid semver version '$ver' (from $source). Expected MAJOR …
     |    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     | Invalid semver version 'c2.0.5' (from release tag 'c2.0.5'). Expected MAJOR.MINOR.PATCH with an optional
     | pre-release suffix, e.g. 1.10.0 or v1.10.0-beta.1
Error: Process completed with exit code 1.
```

### Reproduced

The step's own script was lifted verbatim into
`tests/.artifacts/verify/tagver/repro-before.ps1` (run material, swept after 7 days — the durable
form of these cases is `tests/version/TagVersion.Tests.ps1`) and run on pwsh 7, the same shell the
workflow uses. It reproduces the owner's message character for character:

| Tag | Before the fix |
|---|---|
| `c2.0.5` | **THROW** — `Invalid semver version 'c2.0.5' (from release tag 'c2.0.5')` |
| `v2.0.5` | 2.0.5 |
| `2.0.5` | 2.0.5 |
| `1.10` | 1.10.0 |
| `V2.0.5` | 2.0.5 |
| `release-2.0.5` | **THROW** |
| `components/v2.0.5` | **THROW** |
| `v2.1.1-beta.1` | 2.1.1-beta.1 |

### Root cause

`$ver = $tag -replace '^v', ''` strips a single leading `v` and nothing else, so any other
prefix survives into the semver gate and the step throws. Two consequences, only the first of
which the owner saw:

1. **The release is already published when the run dies.** A GitHub Release is an outward-facing
   event — it notifies watchers and the tag is public. Recovering means deleting the release and
   the tag and cutting them again, so failing here is far more expensive than normalising the
   digits, which are unambiguous. The file already takes the normalising line for a two-part tag
   (`1.10` → `1.10.0`) with exactly that reasoning.
2. **A bad tag left in place poisons later releases from `main`.**
   `publish-nuget.yml` resolves a branch or SHA ref through
   `git describe --tags --abbrev=0`, which returns the nearest tag — `c2.0.5`. The same single-`v`
   strip sits at line 127 of that file, so *every* nuget.org publish with `ref: main` fails the
   same way for as long as `c2.0.5` is the newest reachable tag, whether or not the owner ever
   cuts a prefixed tag again. `scripts/release-*.sh` (dead code, RELEASE.md) writes
   `components/v…`-style tags, which fail identically.

The thrown message also named neither the fix nor the fact that the release itself has to be
re-cut.

### Fixed

`scripts/TagVersion.ps1` — one shared `ConvertTo-PackageVersion`, dot-sourced by both publish
workflows, replacing the two drifted copies of the parsing rule. It strips **any** leading
non-digit prefix, warns in the run summary when that prefix is not the standard `v`, keeps the
two-part normalisation, and when the tag really holds no version throws a message that says what
to do about it. Covered by `tests/version/TagVersion.Tests.ps1` (run in CI by
`.github/workflows/build.yml`) and by the static assertions in `tests/verify/req-fn.spec.ts`.
