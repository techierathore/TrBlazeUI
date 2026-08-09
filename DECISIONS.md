# Decisions

Durable architectural and process decisions for TrBlazeUI. Newest first.

---

## 2026-08-09 — Dual-feed package publishing

TrBlazeUI adopts dual-feed publishing: GitHub Packages remains primary dev feed; NuGet.org added
via on-demand `publish-nuget.yml` using Trusted Publishing/OIDC. All five packages ship together
at one shared version; executed in side-project hours per Plan v2.1 Rule 1.

**Consequences**

- The pre-existing GitHub Packages workflow was renamed `publish-nuget.yml` →
  `publish-github-packages.yml`, contents and triggers unchanged, so the `publish-nuget.yml` name
  could be claimed by the NuGet.org workflow that the trusted publishing policy is bound to.
- No NuGet API key is stored in the repository, in GitHub secrets, or on any developer machine.
  The `NUGET_USER` secret is an account identity, not a credential.
- NuGet.org publishing is `workflow_dispatch`-only and defaults to `dry_run: true`. Public
  versions cannot be deleted, only unlisted.
- Push order is fixed by dependency: Primitives → Icons.Lucide → Icons.Heroicons → Icons.Feather
  → Components. Components depends on both Primitives and Icons.Lucide.
- `Directory.Build.props` `<Version>` is the single source of the shared version. The NuGet.org
  workflow reads it and never overrides it; the GitHub Packages workflow continues to override it
  for `-ci.N` builds.
- Icon packages keep `MIT` rather than the repo's `Apache-2.0`, matching their upstream icon-set
  licensing (Heroicons/Feather MIT, Lucide ISC). `NOTICE` now carries full attribution and is
  packed into all five packages per Apache-2.0 § 4(d).

Full procedure: [NUGET-PUBLISHING.md](NUGET-PUBLISHING.md).
