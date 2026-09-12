# Tests for scripts/TagVersion.ps1 — the tag → package-version rule both publish workflows use.
#
# Deliberately Pester-free: this has to run on a bare windows-latest runner inside
# .github/workflows/build.yml with nothing installed, and on the owner's machine with one command.
#
#     pwsh -NoProfile -File tests/version/TagVersion.Tests.ps1
#
# Exit code 0 = every case passed, 1 = at least one failed (the names of the failures are printed).

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '../../scripts/TagVersion.ps1')

$objFailures = [System.Collections.Generic.List[string]]::new()
$vPassed = 0

# Each case is the tag as it would be cut, and either the version that must come back or $null
# meaning "must throw".
$objCases = @(
    # The documented formats (RELEASE.md): plain semver, optional 'v', optional pre-release.
    @{ Tag = '2.1.1';             Expect = '2.1.1' }
    @{ Tag = 'v2.1.1';            Expect = '2.1.1' }
    @{ Tag = 'V2.1.1';            Expect = '2.1.1' }
    @{ Tag = 'v2.1.1-beta.1';     Expect = '2.1.1-beta.1' }
    @{ Tag = '2.1.1-rc1';         Expect = '2.1.1-rc1' }
    @{ Tag = 'v10.0.100';         Expect = '10.0.100' }

    # A two-part tag is completed rather than failed - NuGet requires three parts.
    @{ Tag = '1.10';              Expect = '1.10.0' }
    @{ Tag = 'v1.10';             Expect = '1.10.0' }

    # THE REGRESSION. 'c2.0.5' (a stray letter where 'v' was meant) failed the 2.0.5 publish on
    # 2026-09-12, after the GitHub Release had already been published. Any non-digit prefix now
    # resolves to the digits the owner typed, with a warning. See docs/CI-Issues.md CI-001.
    @{ Tag = 'c2.0.5';            Expect = '2.0.5' }
    @{ Tag = 'release-2.0.5';     Expect = '2.0.5' }
    @{ Tag = 'rel/2.0.5';         Expect = '2.0.5' }
    # scripts/release-*.sh (dead code) cut tags in this shape; git describe can still return one.
    @{ Tag = 'components/v2.0.5'; Expect = '2.0.5' }
    # Whitespace survives a copy-paste into the workflow_dispatch form.
    @{ Tag = '  v2.0.5  ';        Expect = '2.0.5' }

    # No version in the tag at all: still a hard failure, because there is nothing to infer.
    @{ Tag = '';                  Expect = $null }
    @{ Tag = '   ';               Expect = $null }
    @{ Tag = 'latest';            Expect = $null }
    @{ Tag = 'main';              Expect = $null }
    @{ Tag = 'v2';                Expect = $null }   # one part is not a NuGet version
    @{ Tag = '2026-09-12';        Expect = $null }
    @{ Tag = 'rel2-2.0.5';        Expect = $null }   # a digit inside the prefix is ambiguous
    @{ Tag = 'v2.1.1_beta';       Expect = $null }   # '_' is not a semver pre-release separator
)

foreach ($objCase in $objCases) {
    $vTag = $objCase.Tag
    $vExpect = $objCase.Expect
    $vLabel = "'$vTag'"
    try {
        # 6>$null swallows the Write-Host annotations so the run stays readable; the value under
        # test comes back on the success stream only.
        $vActual = ConvertTo-PackageVersion -Tag $vTag -Source "release tag '$vTag'" 6>$null
        if ($null -eq $vExpect) {
            $objFailures.Add("$vLabel should have thrown, returned '$vActual'")
        } elseif ($vActual -ne $vExpect) {
            $objFailures.Add("$vLabel expected '$vExpect', got '$vActual'")
        } else {
            $vPassed++
        }
    } catch {
        if ($null -eq $vExpect) {
            $vPassed++
        } else {
            $objFailures.Add("$vLabel expected '$vExpect', threw: $($_.Exception.Message.Split("`n")[0])")
        }
    }
}

# The failure message has to tell the owner what to do, not just that the tag was wrong: the
# original message named neither the fix nor the fact that the release itself has to be re-cut.
try {
    ConvertTo-PackageVersion -Tag 'latest' -Source "release tag 'latest'" 6>$null
    $objFailures.Add("the failure message check could not run - 'latest' did not throw")
} catch {
    $vMessage = $_.Exception.Message
    foreach ($vNeeded in @('delete this GitHub Release', 're-cut', 'Nothing has been pushed', 'RELEASE.md')) {
        if ($vMessage -notmatch [regex]::Escape($vNeeded)) {
            $objFailures.Add("the failure message does not say '$vNeeded'")
        } else {
            $vPassed++
        }
    }
}

# A non-canonical prefix must be announced in the run summary, not swallowed - the owner has to
# see which version actually shipped. A canonical 'v' must stay silent.
$vNoisy = (ConvertTo-PackageVersion -Tag 'c2.0.5' -Source "release tag 'c2.0.5'" 6>&1 | Out-String)
if ($vNoisy -notmatch '::warning' -or $vNoisy -notmatch "Publishing version '2\.0\.5'") {
    $objFailures.Add("'c2.0.5' did not raise a ::warning:: naming the version that ships")
} else {
    $vPassed++
}
$vQuiet = (ConvertTo-PackageVersion -Tag 'v2.0.5' -Source "release tag 'v2.0.5'" 6>&1 | Out-String)
if ($vQuiet -match '::warning') {
    $objFailures.Add("'v2.0.5' is the documented format and must not warn")
} else {
    $vPassed++
}

# A tag that is about to fail must not first annotate the run with a version it is "publishing" -
# 'latest' used to warn "Publishing version ''" and throw on the next line.
# The annotations are redirected to a file rather than the pipeline, because a throw discards
# whatever the pipeline had collected so far - the file keeps what was actually written.
$vLogPath = Join-Path ([System.IO.Path]::GetTempPath()) 'tagversion-latest.log'
try { ConvertTo-PackageVersion -Tag 'latest' -Source "release tag 'latest'" 6> $vLogPath } catch { }
$vBogus = if (Test-Path $vLogPath) { Get-Content $vLogPath -Raw } else { '' }
Remove-Item $vLogPath -ErrorAction SilentlyContinue
if ($vBogus -match 'Publishing version') {
    $objFailures.Add("'latest' announced a version it then refused to publish")
} else {
    $vPassed++
}

Write-Host ''
if ($objFailures.Count -gt 0) {
    Write-Host "TagVersion: $($objFailures.Count) FAILED, $vPassed passed"
    $objFailures | ForEach-Object { Write-Host "  FAIL  $_" }
    exit 1
}
Write-Host "TagVersion: $vPassed checks passed, 0 failed"
exit 0
