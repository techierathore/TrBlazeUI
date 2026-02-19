# Release Guide

This document describes the automated NuGet publishing system for TrBlazeUI.

## Overview

TrBlazeUI uses **shared versioning** — all five packages are published with the same version number from each release:

- **TrBlazeUI.Primitives** - Headless UI primitives
- **TrBlazeUI.Components** - Styled components (includes skill file deployment)
- **TrBlazeUI.Icons.Lucide** - Lucide icon library
- **TrBlazeUI.Icons.Heroicons** - Heroicons library
- **TrBlazeUI.Icons.Feather** - Feather icon library

## How Versioning Works

### Release Builds

1. Create a **GitHub Release** with a semver tag (e.g., `1.0.4`)
2. The workflow extracts the version from the tag (stripping an optional `v` prefix)
3. All packages are built and published with that exact version

**Tag format:** plain semver — `1.0.4`, `2.0.0`, `1.1.0-beta.1`

### CI Builds (Push to master)

Every push to `master` triggers a CI build that produces pre-release packages:

- Reads the base version from `Directory.Build.props` (e.g., `1.0.4`)
- Appends `-ci.<run_number>` (e.g., `1.0.4-ci.37`)
- Publishes pre-release packages to GitHub Packages

This lets you test unreleased changes via the pre-release feed.

### Version Override Mechanism

The workflow passes `-p:Version=<version>` to both `dotnet build` and `dotnet pack`, which overrides the `<Version>` property in `Directory.Build.props`. The value in `Directory.Build.props` serves as the base version for local development and CI pre-release suffixing.

## Quick Start

### Creating a Release

1. Ensure all changes are committed and pushed to `master`
2. Go to **GitHub → Releases → Create a new release**
3. Create a new tag with the version number (e.g., `1.0.4`)
4. Add release notes describing the changes
5. Click **Publish release**

The GitHub Actions workflow will automatically build, pack, verify, and publish all packages.

### Updating the Base Version

After a release, bump the version in `Directory.Build.props` for the next development cycle:

```xml
<!-- Base version for local builds. CI/CD overrides via -p:Version= -->
<Version>1.0.5</Version>
```

## GitHub Actions Workflow

**File:** `.github/workflows/publish-nuget.yml`

The workflow runs on:
- **Push to master** → CI pre-release packages
- **GitHub Release published** → Stable release packages

Steps:
1. Checkout repository
2. Setup .NET SDK
3. **Determine package version** (from release tag or base version + CI suffix)
4. Restore, build, and pack with `-p:Version=<version>`
5. **Verify package versions** — confirms all `.nupkg` filenames contain the expected version
6. Publish to GitHub Packages

### Verification

The workflow includes a verification step that checks every generated `.nupkg` filename contains the expected version string. If any package has a mismatched version, the workflow fails loudly instead of silently publishing the wrong version.

## Skill File Deployment

The `TrBlazeUI.Components` package includes buildTransitive targets that automatically deploy skill files (`.claude/commands/trblazeui.md` and `.opencode/commands/trblazeui.md`) to consuming projects at build time. This works via standard NuGet `buildTransitive` targets — no additional configuration needed by consumers.

Skill files are deployed correctly as long as the package version increments (which this versioning fix ensures).

## Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes (backward compatible)
- **Pre-release** (1.0.0-beta.1): Beta/preview versions

## Troubleshooting

### Package version always the same

Ensure the GitHub Release tag is a new version. The `--skip-duplicate` flag on `dotnet nuget push` silently skips packages that already exist — if the version didn't change, nothing new gets published.

### Packages not appearing after release

- Check the GitHub Actions workflow run for errors
- Verify the "Verify package versions" step passed
- Allow 1-2 minutes for GitHub Packages to index new versions

### Local build version differs from CI

This is expected. Local builds use the version from `Directory.Build.props` directly, while CI builds override it via `-p:Version=`.

## Legacy Scripts

The `scripts/release-*.sh` files are legacy from a planned per-package MinVer-based release system that was never implemented. They are not currently used. All releases go through GitHub Releases as described above.
