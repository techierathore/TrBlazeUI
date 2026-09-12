# NuGet Publishing

How TrBlazeUI packages reach consumers, and the exact procedure for publishing a public release
to NuGet.org.

**Status:** set up 2026-08-09. The first public release has **not** been run yet.

---

## 1. The dual-feed model

TrBlazeUI publishes the same five packages to two feeds. They are independent: separate
workflows, separate credentials, separate triggers.

| | **GitHub Packages** | **NuGet.org** |
|---|---|---|
| Role | Primary development feed | Public distribution |
| Audience | Maintainers, internal/preview consumers | Everyone |
| Workflow | `.github/workflows/publish-github-packages.yml` | `.github/workflows/publish-nuget.yml` |
| Trigger | Automatic — push to `main`, and on release | Manual only — `workflow_dispatch` |
| Auth | `GITHUB_TOKEN` (automatic) | Trusted Publishing / OIDC — **no stored key** |
| Versions | Stable **and** `-ci.N` prerelease builds | Stable releases only |
| Consumer setup | PAT with `read:packages` + custom feed | None — default feed |
| Deletable | Yes | **No** — public versions can only be *unlisted* |

The GitHub Packages feed and its workflow are unchanged in behaviour. Every push to `main` still
publishes a `-ci.N` build there, exactly as before.

> **Note on the file rename.** The GitHub Packages workflow used to live at
> `.github/workflows/publish-nuget.yml`. The NuGet.org trusted publishing policy was registered
> against that exact filename, so the GitHub Packages workflow was renamed to
> `publish-github-packages.yml` and the new OIDC workflow took the `publish-nuget.yml` name.
> **The file contents and triggers of the GitHub Packages workflow are byte-for-byte unchanged** —
> only the filename moved. The only visible effect is that its run history in the Actions tab
> restarts under the new workflow name.

### The rule of thumb

Anything that is not a deliberate, reviewed public release goes to GitHub Packages only.
NuGet.org is push-once: **a bad public version cannot be deleted, only unlisted**, and the
version number is burned forever.

---

## 2. Trusted Publishing (OIDC) — how it works

There is **no NuGet API key anywhere** in this repository, in GitHub secrets, or on any
developer machine.

Instead, NuGet.org holds a *trusted publishing policy* that says, in effect:

> "GitHub Actions may publish these packages, but only when the job runs **in repository
> `techierathore/TrBlazeUI`** from **the workflow file `.github/workflows/publish-nuget.yml`**."

At run time:

1. The job requests an OIDC token from GitHub. This requires `permissions: id-token: write` at
   the job level — without it the request fails and nothing else works.
2. GitHub mints a short-lived, cryptographically signed token asserting the repository, the
   workflow file path, the ref, and the run ID. GitHub signs this; the workflow cannot forge it.
3. `NuGet/login@v1` presents that token to NuGet.org along with `user: ${{ secrets.NUGET_USER }}`.
4. NuGet.org validates the assertions against the policy and returns a **temporary API key**.
5. That key is used for the `dotnet nuget push` calls and then expires on its own.

### What the policy is bound to

| Bound to | Value |
|---|---|
| NuGet.org account | the profile named in the `NUGET_USER` repo secret |
| Repository owner | `techierathore` |
| Repository name | `TrBlazeUI` |
| Workflow file | `publish-nuget.yml` |

**Renaming or moving `publish-nuget.yml` breaks publishing** until the policy is updated on
nuget.org to match the new path. This is the single most likely cause of a sudden
`403 Forbidden` on a workflow that used to work. Same applies to moving the repo or renaming
the owner.

### Temporary key mechanics

- The key returned by `NuGet/login@v1` is **short-lived — roughly one hour**.
- One hour comfortably covers all five pushes, so the workflow calls `NuGet/login@v1` **once**,
  immediately before the push step, and reuses the key for all five packages. There is no need
  to re-login between pushes.
- The login step is placed late in the job deliberately: build, pack and verification all happen
  *before* any credential exists, so a failure in those stages can never publish anything.
- The key is scoped to what the policy allows. It is not a general-purpose account key.

### `NUGET_USER` is not a credential

The `NUGET_USER` repo secret holds the **nuget.org profile name** that owns the policy. It is an
identity, not a password — it identifies which account's policies to evaluate. It is stored as a
secret only to keep it out of logs.

---

## 3. The five packages, and push order

All five ship together, at one shared version, in every public release.

| # | Package | Depends on (TrBlazeUI) | License | Notes |
|---|---|---|---|---|
| 1 | `TrBlazeUI.Primitives` | — | Apache-2.0 | Headless, unstyled primitives |
| 2 | `TrBlazeUI.Icons.Lucide` | — | MIT | 1,640+ icons |
| 3 | `TrBlazeUI.Icons.Heroicons` | — | MIT | 1,288 icons, 4 variants |
| 4 | `TrBlazeUI.Icons.Feather` | — | MIT | 286 icons |
| 5 | `TrBlazeUI.Components` | **Primitives + Icons.Lucide** | Apache-2.0 | Styled components; ships the CSS |

The icon packages carry `MIT` rather than the repo's `Apache-2.0` because they redistribute
upstream icon artwork licensed MIT (Heroicons, Feather) and ISC (Lucide). Attribution for all of
them is in `NOTICE`, which is packed into the root of all five packages per Apache-2.0 § 4(d).

### Push order

```
Primitives  →  Icons.Lucide  →  Icons.Heroicons  →  Icons.Feather  →  Components
```

**Why order matters.** NuGet.org runs *asynchronous validation* after a push. A package is not
publicly restorable until its own validation completes. `TrBlazeUI.Components` declares hard
dependencies on `TrBlazeUI.Primitives` **and `TrBlazeUI.Icons.Lucide`** — so both must be pushed
and validated before Components can restore cleanly for a public consumer.

> Note that Components depends on **Icons.Lucide too**, not only Primitives. Lucide is not
> optional for Components and must precede it in the order.

**Why one job with one login is fine.** The temporary key lives about an hour, far longer than
five pushes take, so a single `NuGet/login@v1` covers the whole sequence.

**Why the race does not matter.** If Components is pushed before Primitives has finished
validating, the push itself still succeeds — only public *restore* is briefly inconsistent, and
it resolves itself once validation completes (typically well under 15 minutes). Every push uses
`--skip-duplicate`, so **re-running the workflow is always safe**: already-published packages
no-op instead of failing the run.

---

## 4. Shared version rule

**All five packages carry one version, and that version is the release tag.**

- Both workflows resolve the version from the **release tag** and pass it as `-p:Version=` to
  `dotnet build` and `dotnet pack`. The GitHub Packages workflow also builds a `-ci.N`
  pre-release stem on a push to `main`.
- The `<Version>` element in `Directory.Build.props` is the **local-build fallback and the CI
  pre-release stem** — not the released version. It is not bumped as part of ordinary work, so it
  goes stale by design.
- A real (non-dry-run) push to nuget.org with a version that came from `Directory.Build.props`
  instead of a tag is **refused** by the *Refuse to publish a non-tag version* step.

> **Corrected 2026-09-12.** This section used to say the NuGet.org workflow "reads
> that version and never overrides it", which stopped being true on 2026-08-31 when the release
> tag became the version. Believing the old text is how nuget.org sat on `2.0.0` across two
> release cycles while every run went green.

To release a new public version: cut the GitHub Release with the tag you want published, then
dispatch the workflow with that tag as the `ref`. Tag format and what happens to a mistyped
prefix: `RELEASE.md`.

> `TrBlazeUI.Components.csproj` has an alternate `UsePackageReferences=true` path that references
> Primitives and Icons.Lucide as packages rather than projects. Those references use
> `Version="$(Version)"` so they follow the shared version automatically. They previously carried
> a hard-coded `2.0.0`, which would have silently drifted.

---

## 5. Metadata checklist

Verified 2026-08-09 against all five `.csproj` files. Repo-wide values live in
`Directory.Build.props`; per-package values live in each `.csproj`.

| Item | Where | Status |
|---|---|---|
| `PackageId` | per-package | ✅ all five, matches assembly name |
| `Authors` | `Directory.Build.props` + per-package | ✅ `TrBlazeUI Contributors` |
| `Description` | per-package | ✅ **distinct per package**, not copy-pasted |
| `PackageLicenseExpression` | per-package | ✅ Apache-2.0 (Components, Primitives) / MIT (icons) |
| `PackageProjectUrl` | `Directory.Build.props` | ✅ |
| `RepositoryUrl` + `RepositoryType` | `Directory.Build.props` | ✅ |
| `PackageTags` | per-package | ✅ distinct, relevant |
| `PackageReadmeFile` | per-package | ✅ each packs its own `README.md` to root |
| `PublishRepositoryUrl` | `Directory.Build.props` | ✅ added |
| `EmbedUntrackedSources` | `Directory.Build.props` | ✅ added — covers Razor-generated sources |
| `ContinuousIntegrationBuild` | `Directory.Build.props` | ✅ added, CI-only |
| SourceLink provider | .NET 8+ SDK built-in | ✅ no `PackageReference` needed |
| `GeneratePackageOnBuild` | `Directory.Build.props` | ✅ **`false`** |
| `GenerateDocumentationFile` | `Directory.Build.props` | ✅ XML docs ship in `lib/` |
| `NOTICE` packed | `Directory.Build.props` | ✅ root of all five, Apache-2.0 § 4(d) |

Confirmed in the generated nuspec: SourceLink writes
`<repository type="git" url="..." branch="..." commit="..."/>`.

### The CSS check — the one that actually matters

`TrBlazeUI.Components` is a *styled* component library. A public first release that ships without
its stylesheet renders as unstyled HTML for every consumer, and **cannot be fixed by replacing
the version — only by unlisting it and burning a new version number.**

The pre-built CSS is committed at `src/TrBlazeUI.Components/wwwroot/trblazeui.css` (the Tailwind
build target is Windows-and-local-only and is skipped under `CI=true`). Razor SDK packs `wwwroot`
into `staticwebassets/`, which the consuming app surfaces at
`_content/TrBlazeUI.Components/trblazeui.css`.

**Verified locally on 2026-08-09:**

```
    88202  staticwebassets/trblazeui.css        <- 88 KB, present
    14504  staticwebassets/css/trblazeui-input.css
     1572  staticwebassets/js/file-upload.js
            ... (12 further JS interop files)
```

This is no longer a manual check. The workflow's **Verify packaged assets** step opens each
`.nupkg` and hard-fails the run if `staticwebassets/trblazeui.css`, `NOTICE`, or `README.md` is
missing — before any credential is minted. The full content listing of all five packages is also
dumped to the job log for human review.

### Packaging defect found and fixed during setup

The local pack surfaced `NU5129` and these entries in the Components package:

```
buildTransitive//TrBlazeUI.Components.targets     <- doubled separator
skills//claude-code-trblazeui.md
skills//opencode-trblazeui.md
```

Cause: `PackagePath="buildTransitive\"` — a *trailing backslash*. Windows normalised it, so CI
never caught it; macOS/Linux produced a doubled separator that NuGet does **not** normalise. At
`buildTransitive//TrBlazeUI.Components.targets` the targets file sits outside NuGet's
convention-based import path, so **consumers never auto-import it** and the docs/skills
auto-deploy feature silently does nothing.

Fixed by using forward slashes with no trailing separator, which behaves identically on both
platforms. The verification step now fails the run on any packaged entry containing `//`, so this
cannot regress silently.

---

## 6. Dispatch procedure

Publishing is **always manual**. There is no automatic trigger to NuGet.org.

### Step 1 — pre-flight

- [ ] `Directory.Build.props` `<Version>` is the version you intend to publish publicly.
- [ ] That version has **never** been published to NuGet.org before (public versions are permanent).
- [ ] `CHANGELOG.md` is updated.
- [ ] The commit you want to publish is pushed to the ref you will dispatch against.

### Step 2 — dry run (always do this first)

1. GitHub → **Actions** → **Publish to NuGet.org** → **Run workflow**
2. `ref` = `main` (or the tag/SHA to publish)
3. `dry_run` = **`true`** ← this is the default
4. **Run workflow**

The dry run builds, tests, packs, dumps the full content listing of all five packages, and runs
the asset verification — but never calls `NuGet/login`, so **no credential is ever minted and
nothing can be pushed.**

Review in the job log:
- the resolved version, in the *Resolve shared package version* step
- `staticwebassets/trblazeui.css` present in the Components listing
- `NOTICE` and `README.md` present in all five
- all five packages listed at the same version
- the *Verify packaged assets* step green

### Step 3 — real publish

Re-run the same workflow with the **same `ref`**, and `dry_run` = **`false`**.

Expected sequence in the log:

```
Resolve shared package version   ->  Publishing version: 2.0.0
Restore / Build / Test
Pack all five packages           ->  5 .nupkg files
List .nupkg contents             ->  full listing of all five
Verify packaged assets           ->  All five packages verified at version 2.0.0
NuGet login (Trusted Publishing) ->  temporary API key acquired
Push packages to nuget.org       ->  Primitives
                                     Icons.Lucide
                                     Icons.Heroicons
                                     Icons.Feather
                                     Components
```

---

## 7. Verification

### Immediately after the run

- All five push steps report success.
- Each package appears at `https://www.nuget.org/packages/<PackageId>/` and shows
  *"This package has not been indexed yet"* — this is normal.

### After indexing (typically under 15 minutes)

- [ ] All five listed at the published version on nuget.org.
- [ ] Components page shows dependencies on **Primitives and Icons.Lucide**.
- [ ] Each package page renders its README.
- [ ] License shows Apache-2.0 (Components, Primitives) / MIT (icons).
- [ ] README badges at the top of this repo resolve to the published version.

### The success test

The real test is a consumer with **zero configuration** — no PAT, no custom feed, only the
default nuget.org source:

```bash
cd $(mktemp -d)
dotnet new blazor -o TrBlazeUITest
cd TrBlazeUITest

# Prove no inherited feed config is in play
dotnet nuget list source

dotnet add package TrBlazeUI.Components
dotnet build
```

**Pass criteria:**

- [ ] `dotnet add package TrBlazeUI.Components` succeeds with no auth prompt.
- [ ] `TrBlazeUI.Primitives` **and** `TrBlazeUI.Icons.Lucide` resolve automatically as transitive
      dependencies (check `obj/project.assets.json` or the build output).
- [ ] `dotnet build` succeeds.
- [ ] Adding `<link rel="stylesheet" href="_content/TrBlazeUI.Components/trblazeui.css" />` to
      `App.razor` and running the app produces **styled** components — this is the end-to-end
      proof the CSS survived packing.

> Run this in a temp directory outside this repo. Inside the repo, the root `nuget.config` and a
> possible pre-configured `TrBlazeUI` GitHub Packages source would invalidate the test.

---

## 8. Troubleshooting

### `403 Forbidden` from `NuGet/login@v1`

In rough order of likelihood:

1. **Workflow file path does not match the policy.** The policy is bound to
   `.github/workflows/publish-nuget.yml`. Renaming or moving it breaks the match. Update the
   policy on nuget.org to the new path.
2. **The policy is inactive.** See below.
3. **`NUGET_USER` is wrong or unset.** It must be the nuget.org *profile name* that owns the
   policy, not an email address and not a key.
4. **Missing `id-token: write`.** Check the job-level `permissions:` block.
5. **Dispatched from a fork.** OIDC assertions carry the fork's repository, which will not match.

### Policy shows "inactive" / an inactivity warning on nuget.org

NuGet.org disables trusted publishing policies that sit unused after creation (documented as a
7-day window at time of writing), and may flag long-dormant policies. Because this workflow is
on-demand and may not run for months, **expect to hit this**.

The fix is on the nuget.org policy page — re-enable or re-create the policy, then re-run the
workflow. Check the policy page *before* dispatching a release you are in a hurry to ship, and
confirm the exact current rule there rather than relying on the number quoted here.

### `409 Conflict` / "already exists"

The version was already published. Public versions are permanent and cannot be overwritten —
bump `<Version>` in `Directory.Build.props` and publish a new one. `--skip-duplicate` normally
converts this into a skip rather than a failure.

### Components does not restore right after publishing

Almost always the validation race: Primitives or Icons.Lucide has not finished validating yet.
Wait ~15 minutes. If a push genuinely failed mid-sequence, just re-run the workflow —
`--skip-duplicate` makes it idempotent.

### `NU5129` or malformed package paths

Some `PackagePath` has a trailing separator. Use forward slashes with no trailing separator (see
§ 5). The verification step fails the run on any entry containing `//`.

### Break-glass: publishing with an ad-hoc API key

**Last resort only** — if trusted publishing is broken and a release genuinely cannot wait.

1. On nuget.org, create an API key scoped to **only** the five `TrBlazeUI.*` package IDs, with
   the **shortest possible expiry**.
2. Push from a clean local checkout of the exact ref, after running the same
   build → pack → content-listing checks the workflow performs:
   ```bash
   dotnet nuget push ./nupkgs/TrBlazeUI.Primitives.<ver>.nupkg \
     --api-key <KEY> --source https://api.nuget.org/v3/index.json --skip-duplicate
   # ...repeat in the § 3 push order
   ```
3. **Revoke the key on nuget.org immediately afterwards.**
4. Record why it was needed, and fix the trusted publishing path so the next release is normal.

Do **not** store an API key in GitHub secrets "just in case" — a standing key defeats the entire
point of OIDC and is exactly the thing this setup exists to avoid.

---

## 9. Backlog

### ID prefix reservation — `TrBlazeUI.*` (joint with TechieRag)

Not yet requested. Reserving the `TrBlazeUI.` ID prefix on nuget.org prevents anyone else from
publishing a package under that prefix and gives packages the verified-owner check mark on their
nuget.org pages.

- Requested through nuget.org (Manage Packages → prefix reservation request); it is a manual
  review by the NuGet team, not self-service.
- To be filed **jointly with the TechieRag prefix reservation**, since both are owned by the same
  nuget.org account and can go in as one coordinated request.
- Requires the packages to be published first — so this is a post-first-release task.

### Symbol packages (`.snupkg`)

SourceLink metadata is embedded, but symbol packages are not currently published. Adding
`IncludeSymbols` + `SymbolPackageFormat=snupkg` and pushing the `.snupkg` files would let
consumers step into TrBlazeUI source under a debugger. Deferred — not required for the first
release.

### `HtmlSanitizer` prerelease dependency

`TrBlazeUI.Components` pins `HtmlSanitizer 9.1.949-beta` deliberately (CVE-2026-54570 /
REQ-NFR-003 — the stable line hard-pins a vulnerable AngleSharp). This makes the stable
Components package carry a prerelease dependency, which is why `NU5104` is suppressed for that
one project. It resolves correctly for consumers, but it is visible on the nuget.org package
page. Drop the suppression once a stable `HtmlSanitizer 9.1.x` ships (REQ-FN-009).
