# TrBlazeUI — decisions I need from you

| | |
|---|---|
| App | TrBlazeUI |
| Written | 2026-09-22 |
| Waiting on | Whether the last three releases were meant for external users too. |

## What happened

**Answered 2026-09-22: both sources are real, for different audiences.** GitHub Packages is the
source for this organisation's own applications; nuget.org is the source for external users. The
AI reference now carries that, with the sign-in steps for the internal source. The README was
left alone, as asked. The original request is kept below.

One thing from it still stands and is **not** covered by the answer: nuget.org is at 2.0.6, so
external users cannot reach 2.0.7, 2.0.8 or 2.0.9. Whether those three were meant for external
users is a separate question, asked at the foot of this file.

---

You published 2.0.9 today. It went to **GitHub Packages**. So did 2.0.8 and 2.0.7.

**nuget.org has not had a new version since 2.0.6 on 2026-09-13.** I checked the public index
for all five packages: every one stops at 2.0.6.

The project also said one thing and did the other. The requirement on the checklist is named
"GitHub Packages CI/CD", but the check that proves it reads **nuget.org**, and there are two
publish workflows, one per shop. That check has failed since 2026-09-15 for a true reason.

One thing already cost a consumer real work. Three releases went out with no changelog entry,
so everything in them sat under "unreleased" and the repository called shipped work
unpublished. The Chatur team read that and reported two controls as missing that had been
published the day before they wrote.

## What I need you to decide

### 1. Were 2.0.7, 2.0.8 and 2.0.9 meant for external users too?

Your answer settles which source each audience uses, but not this. nuget.org is at **2.0.6**, so
an external user cannot reach any of the last three releases — including every control built for
the two consumer reports.

I need this because the check behind the release requirement currently demands that the newest
release tag be on nuget.org. Under your answer that is only true for versions meant for external
users, and I do not know which those are, so I cannot make the check honest without guessing. That
requirement is marked as needing a re-check until then.

| Option | What happens | What it costs |
|---|---|---|
| **A — internal-only** | The last three stay off nuget.org. I change the check to prove the public source's newest version came from its own tag, and to stop demanding the newest tag be there. | External users stay on 2.0.6 until you choose to publish one. |
| **B — public too** | I walk the publish of 2.0.7, 2.0.8 and 2.0.9 to nuget.org and confirm all five packages at each. The check then passes unchanged. | One publish run. Public versions cannot be withdrawn afterwards, only hidden. |

**My recommendation: B** — the controls in those three releases are the ones two consumer teams
asked for, and nothing in them is specific to this organisation.

### 2. Whether a release without a changelog entry should be blocked

Three releases went out unrecorded because nothing stopped them, and an outside team paid for it.
The habit is the real fix — write the section when you cut the tag — but it can be enforced.

| Option | What happens | What it costs |
|---|---|---|
| **Yes** | A release whose version has no changelog section fails the build. | A few minutes to add; an occasional blocked release when you are in a hurry. |
| **No** | It stays a habit. | It already failed once, at a consumer's expense. |

**My recommendation: yes** — this one went unnoticed for a week and was found by an outside team,
not by us.

## What I do when you answer

1. For B: walk the three publishes and confirm all five packages at each version.
   For A: change the check to match, so it passes for a true reason instead of being ignored.
2. Either way, correct the release requirement's wording, which names one source and tests the other.
3. For yes on the second: add the changelog check and prove it against 2.0.9.

## Copy this back to me

```
TrBlazeUI: those three were internal-only. Change the release check to match and re-verify that requirement.
```

```
TrBlazeUI: publish 2.0.7, 2.0.8 and 2.0.9 to nuget.org as well, then re-verify the release requirement.
```

```
TrBlazeUI: also block a release whose version has no changelog entry, and prove the check against 2.0.9.
```

---

*Answered 2026-09-13 — the next release number.* I had suggested `v2.1.1`, guessing from the
`2.1.0` in `Directory.Build.props`, which is only the number local builds use when nobody
passes one in. That was my mistake. Released as 2.0.6.
