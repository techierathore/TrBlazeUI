# TrBlazeUI — CI / release pipeline issues

Pipeline defects reported from a GitHub Actions run log, as opposed to the consumer feedback
files (`docs/<Consumer>-TrBlazeUI-Feedback.md`) and the component issue reports. One dated entry
per report, newest first, with the log as it was handed over.

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
