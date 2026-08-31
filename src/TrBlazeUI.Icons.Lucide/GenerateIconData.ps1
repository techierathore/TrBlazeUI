# PowerShell script to convert lucide.json to C# dictionary code

$jsonPath = Join-Path $PSScriptRoot "lucide.json"
$outputPath = Join-Path $PSScriptRoot "Data\LucideIconData.cs"

Write-Host "Reading Lucide icon data from $jsonPath..."
$json = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json

# NOTE: wrap in @(...) before asking for .Count - a bare .Count on the property collection
# returns 1 (it binds to the single PSPropertySet), which is what put "Contains 1 icons"
# into the generated <summary> before this was fixed.
$iconProperties = @($json.icons.PSObject.Properties) | Sort-Object Name
$iconCount = $iconProperties.Count
Write-Host "Found $iconCount icons"

# lucide.json carries a second top-level map, "aliases", holding the pre-rename and
# alternate spellings (e.g. check-circle -> circle-check-big). It used to be dropped here,
# which made every one of those names render nothing at all in LucideIcon. Keep only the
# aliases whose parent really is a canonical icon so no dangling entry is ever emitted.
$aliasProperties = @()
if ($null -ne $json.aliases) {
    $aliasProperties = @($json.aliases.PSObject.Properties) |
        Where-Object { $null -ne $_.Value.parent -and $null -ne $json.icons.$($_.Value.parent) } |
        Sort-Object Name
}
$aliasCount = $aliasProperties.Count
Write-Host "Found $aliasCount aliases"

# Create Data directory if it doesn't exist
$dataDir = Join-Path $PSScriptRoot "Data"
if (!(Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir | Out-Null
    Write-Host "Created Data directory"
}

# Start building the C# file
$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine("// This file is auto-generated. Do not edit manually.")
# The colons are escaped so the stamp does not pick up the machine's locale time separator.
[void]$sb.AppendLine("// Generated from lucide.json on $(Get-Date -Format 'yyyy-MM-dd HH\:mm\:ss')")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("namespace TrBlazeUI.Icons.Lucide.Data;")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("/// <summary>")
[void]$sb.AppendLine("/// Provides access to Lucide icon SVG data.")
[void]$sb.AppendLine(("/// Contains {0} icons from the Lucide icon set, plus {1} deprecated and" -f $iconCount, $aliasCount))
[void]$sb.AppendLine("/// alternate names that resolve to one of them.")
[void]$sb.AppendLine("/// </summary>")
[void]$sb.AppendLine("public static class LucideIconData")
[void]$sb.AppendLine("{")
[void]$sb.AppendLine("    private static readonly IReadOnlyDictionary<string, string> Icons = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)")
[void]$sb.AppendLine("    {")

# Add each icon to the dictionary
$lastIndex = $iconProperties.Count - 1
$currentIndex = 0

foreach ($icon in $iconProperties) {
    $iconName = $icon.Name
    $iconBody = $icon.Value.body

    # Escape double quotes and backslashes in the SVG
    $escapedBody = $iconBody -replace '\\', '\\' -replace '"', '\"'

    # Add comma except for last item
    $comma = if ($currentIndex -eq $lastIndex) { "" } else { "," }

    [void]$sb.AppendLine("        [`"$iconName`"] = `"$escapedBody`"$comma")

    $currentIndex++

    if ($currentIndex % 100 -eq 0) {
        Write-Host "Processed $currentIndex / $iconCount icons..."
    }
}

[void]$sb.AppendLine("    };")
[void]$sb.AppendLine("")
[void]$sb.AppendLine('    /// <summary>')
[void]$sb.AppendLine('    /// Maps the deprecated and alternate Lucide icon names to the canonical icon each')
[void]$sb.AppendLine('    /// one resolves to (for example "check-circle" to "circle-check-big"). Generated from')
[void]$sb.AppendLine('    /// the "aliases" section of lucide.json; every value is guaranteed to be a key of')
[void]$sb.AppendLine('    /// <see cref="Icons"/>, so a lookup through this map never dangles.')
[void]$sb.AppendLine('    /// </summary>')
# Declared as the concrete Dictionary, not IReadOnlyDictionary: every use of this field is
# internal (TryGetValue / ContainsKey / Count), so CA1859 — which is an ERROR here under
# TreatWarningsAsErrors — requires the concrete type. GetAliases() still hands callers an
# IReadOnlyDictionary; Dictionary converts to it implicitly, so the public surface is unchanged.
[void]$sb.AppendLine("    private static readonly Dictionary<string, string> Aliases = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)")
[void]$sb.AppendLine("    {")

# Add each alias to the dictionary
$lastAliasIndex = $aliasProperties.Count - 1
$currentIndex = 0

foreach ($alias in $aliasProperties) {
    $aliasName = $alias.Name
    $parentName = $alias.Value.parent

    # Add comma except for last item
    $comma = if ($currentIndex -eq $lastAliasIndex) { "" } else { "," }

    [void]$sb.AppendLine("        [`"$aliasName`"] = `"$parentName`"$comma")

    $currentIndex++
}

# The rest of the class is fixed text - kept verbatim in a single-quoted here-string so the C#
# below is exactly what lands in the generated file (no PowerShell escaping to unpick). It is
# appended a line at a time so the whole file keeps one consistent line ending.
$tail = @'
    };

    /// <summary>
    /// Index of canonical icon names keyed by their hyphen-separated words sorted
    /// alphabetically, used to suggest a real icon for an unrecognised name whose words
    /// match one in a different order. Built on first use, which for a healthy app is never.
    /// </summary>
    private static readonly Lazy<Dictionary<string, string>> WordKeyIndex =
        new(BuildWordKeyIndex);

    /// <summary>
    /// Resolves an icon name to its canonical form, following the alias table when the name
    /// is one of the deprecated or alternate spellings.
    /// </summary>
    /// <param name="name">The name of the icon (case-insensitive).</param>
    /// <returns>The canonical icon name, or null when the name matches no icon and no alias.</returns>
    public static string? ResolveName(string name)
    {
        if (Icons.ContainsKey(name))
        {
            return name;
        }

        return Aliases.TryGetValue(name, out var canonical) ? canonical : null;
    }

    /// <summary>
    /// Retrieves the SVG content for the specified icon name. Deprecated and alternate
    /// spellings resolve through the alias table to their canonical icon, so names such as
    /// "check-circle" or "alert-triangle" render the icon they were renamed to instead of
    /// silently rendering nothing.
    /// </summary>
    /// <param name="name">The name of the icon (case-insensitive).</param>
    /// <returns>The SVG path data for the icon, or null if not found.</returns>
    public static string? GetIcon(string name)
    {
        if (Icons.TryGetValue(name, out var svg))
        {
            return svg;
        }

        return Aliases.TryGetValue(name, out var canonical) && Icons.TryGetValue(canonical, out var aliasSvg)
            ? aliasSvg
            : null;
    }

    /// <summary>
    /// Gets all available icon names. Canonical names only: the deprecated and alternate
    /// spellings are accepted by <see cref="GetIcon"/> and <see cref="IconExists"/> but are
    /// deliberately excluded here so that this enumeration (and <see cref="IconCount"/>)
    /// stays a count of distinct icons rather than of spellings, and so that icon browsers
    /// built on it do not show the same glyph several times under its old names.
    /// Call <see cref="GetAliases"/> when the alternate spellings are wanted too.
    /// </summary>
    /// <returns>An enumerable collection of canonical icon names.</returns>
    public static IEnumerable<string> GetAvailableIcons() => Icons.Keys;

    /// <summary>
    /// Gets the alias table: every deprecated or alternate icon name mapped to the canonical
    /// icon it resolves to.
    /// </summary>
    /// <returns>A read-only view of the alias-to-canonical-name map.</returns>
    public static IReadOnlyDictionary<string, string> GetAliases() => Aliases;

    /// <summary>
    /// Checks if an icon with the specified name exists, accepting the deprecated and
    /// alternate spellings in the alias table as well as canonical names.
    /// </summary>
    /// <param name="name">The name of the icon (case-insensitive).</param>
    /// <returns>True if the icon exists, false otherwise.</returns>
    public static bool IconExists(string name) => Icons.ContainsKey(name) || Aliases.ContainsKey(name);

    /// <summary>
    /// Gets the total number of available icons. Canonical icons only; the alternate
    /// spellings counted by <see cref="AliasCount"/> are not included.
    /// </summary>
    public static int IconCount => Icons.Count;

    /// <summary>
    /// Gets the number of deprecated and alternate icon names that resolve to a canonical icon.
    /// </summary>
    public static int AliasCount => Aliases.Count;

    /// <summary>
    /// Suggests a real icon for a name that matches neither an icon nor an alias, by looking
    /// for a canonical icon built from the same hyphen-separated words in a different order
    /// (for example "check-big-circle" suggests "circle-check-big"). Intended for diagnostics
    /// only, so that an unknown name is reported with a usable replacement instead of just
    /// rendering a blank placeholder.
    /// </summary>
    /// <param name="name">The unrecognised icon name (case-insensitive).</param>
    /// <returns>The suggested canonical icon name, or null when nothing close was found.</returns>
    public static string? FindSimilarIcon(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return WordKeyIndex.Value.TryGetValue(BuildWordKey(name), out var suggestion) ? suggestion : null;
    }

    /// <summary>
    /// Builds the word-order-insensitive lookup key for an icon name: its hyphen-separated
    /// words sorted alphabetically and rejoined.
    /// </summary>
    /// <param name="name">The icon name to key.</param>
    /// <returns>The normalised lookup key.</returns>
    private static string BuildWordKey(string name)
    {
        var words = name.Split('-', StringSplitOptions.RemoveEmptyEntries);
        Array.Sort(words, StringComparer.OrdinalIgnoreCase);
        return string.Join('-', words);
    }

    /// <summary>
    /// Builds the word-key index over every canonical icon name. A few icons share a key
    /// (for example "area-chart" and "chart-area"); the first in the dictionary's alphabetical
    /// order wins, which keeps the suggestion deterministic.
    /// </summary>
    /// <returns>The populated index.</returns>
    private static Dictionary<string, string> BuildWordKeyIndex()
    {
        var index = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var iconName in Icons.Keys)
        {
            index.TryAdd(BuildWordKey(iconName), iconName);
        }

        return index;
    }
}
'@

foreach ($line in ($tail -split "\r?\n")) {
    [void]$sb.AppendLine($line)
}

# Write to file
$sb.ToString() | Out-File -FilePath $outputPath -Encoding UTF8
# Plain ASCII: Windows PowerShell 5.1 reads a BOM-less .ps1 as ANSI, and a non-ASCII glyph
# here is enough to break the script open with a parser error under that host.
Write-Host "OK - Generated C# file: $outputPath"
Write-Host "OK - Total icons: $iconCount"
Write-Host "OK - Total aliases: $aliasCount"
