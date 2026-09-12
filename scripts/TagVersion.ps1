# TagVersion.ps1 — the one rule that turns a git tag into a NuGet package version.
#
# THIS FILE IS LIVE. Unlike scripts/release-*.sh (dead code, see RELEASE.md), both publish
# workflows dot-source it:
#   .github/workflows/publish-github-packages.yml  -> step "Determine package version"
#   .github/workflows/publish-nuget.yml            -> step "Resolve shared package version"
# It exists because those two steps carried drifted copies of the same parsing rule, so a defect
# in one was only half-present in the other. Change the rule here, once.
#
# Usage inside a `shell: pwsh` step, after actions/checkout:
#     . ./scripts/TagVersion.ps1
#     $ver = ConvertTo-PackageVersion -Tag $tag -Source "release tag '$tag'"
# Warnings go to the host (they surface as ::warning:: annotations in the run summary); only the
# version comes back on the success stream, so `$ver` is the version and nothing else.
#
# Tested by tests/version/TagVersion.Tests.ps1, which .github/workflows/build.yml runs on every
# push and pull request.

# No Set-StrictMode here on purpose: this file is dot-sourced INTO a workflow step, so anything
# it sets stays in effect for the rest of that step's script. Strictness is the caller's call.

<#
.SYNOPSIS
    Reads a semver package version out of a release tag.
.DESCRIPTION
    Accepts the tag formats RELEASE.md documents - plain semver with an optional 'v', with an
    optional pre-release suffix - and normalises the two shapes a hand-cut tag actually arrives
    in as well:

      * ANY leading non-digit prefix is stripped, not just 'v'. On 2026-09-12 the 2.0.5 release
        was cut as 'c2.0.5' - a stray letter where 'v' was meant - and the publish died on the
        semver gate AFTER the GitHub Release had been published, which is an outward-facing event
        that can only be undone by deleting the release and its tag. The digits in the tag are
        unambiguous, so a non-canonical prefix is normalised and warned about rather than being
        allowed to fail a release. A prefix that is not 'v' raises a ::warning:: naming the
        version that will actually ship.

      * A two-part tag is completed ('1.10' -> '1.10.0'), because NuGet requires three parts.

    A tag that holds no version at all is still a hard failure - there is nothing to guess - and
    the message says what to do about it.
.PARAMETER Tag
    The tag as it was cut, e.g. 'v2.1.1', '2.1.1-beta.1', 'c2.0.5'.
.PARAMETER Source
    How the tag was resolved, quoted back in any failure message, e.g. "release tag 'v2.1.1'".
.PARAMETER Advice
    What the owner should do if the value cannot be read. Defaults to the release-tag recovery,
    because that is where a hand-cut value comes from; a caller resolving from somewhere else
    (Directory.Build.props, say) passes the advice that fits its own source.
.OUTPUTS
    System.String - the version to pass as -p:Version=, e.g. '2.1.1'.
#>
function ConvertTo-PackageVersion {
    [CmdletBinding()]
    [OutputType([string])]
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string] $Tag,
        [string] $Source = 'the release tag',
        [string] $Advice = 'To recover: delete this GitHub Release AND its tag, re-cut both with a valid tag, then publish again.'
    )

    $vTrimmed = $Tag.Trim()
    if ([string]::IsNullOrWhiteSpace($vTrimmed)) {
        throw "No version to publish: $Source is empty. Cut a release tag first (e.g. v2.1.1) - see RELEASE.md."
    }

    # Split the tag into its leading non-digit prefix and the rest.
    $vPrefix = ''
    if ($vTrimmed -match '^([^0-9]+)') { $vPrefix = $Matches[1] }
    $vVersion = $vTrimmed.Substring($vPrefix.Length)

    # Tags are sometimes cut with only MAJOR.MINOR (e.g. '1.10'). NuGet requires three parts, so
    # normalise rather than failing the release.
    if ($vVersion -match '^\d+\.\d+$') {
        Write-Host "Tag '$vTrimmed' has only two version parts; normalising to '$vVersion.0'"
        $vVersion = "$vVersion.0"
    }

    # Validate BEFORE warning about the prefix: a warning that says which version is shipping has
    # to be true. 'latest' would otherwise annotate the run with "publishing version ''" and then
    # throw a line later.
    if ($vVersion -notmatch '^\d+\.\d+\.\d+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$') {
        throw @"
Cannot read a version out of $Source.
Read as: '$vVersion'$(if ($vPrefix) { " (after ignoring the prefix '$vPrefix')" }).
A version must be MAJOR.MINOR.PATCH with an optional 'v' and an optional pre-release suffix -
e.g. 2.1.1, v2.1.1, v2.1.1-beta.1 (RELEASE.md).
$Advice
Nothing has been pushed.
"@
    }

    # 'v' and 'V' are the documented, canonical prefix and pass silently. Anything else is a tag
    # that does not follow RELEASE.md, so it ships with the version called out loudly.
    if ($vPrefix -and $vPrefix -notmatch '^[vV]$') {
        Write-Host "::warning title=Non-canonical release tag::Tag '$vTrimmed' is not the documented format. Publishing version '$vVersion' (the '$vPrefix' prefix was ignored). Cut future tags as 'v$vVersion' or '$vVersion' - see RELEASE.md."
    }

    return $vVersion
}
