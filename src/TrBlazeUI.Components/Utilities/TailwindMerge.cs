using System.Collections.Concurrent;
using System.Text.RegularExpressions;

namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// Provides Tailwind CSS class conflict resolution logic.
/// Intelligently merges Tailwind utility classes by identifying conflicts
/// and keeping only the last occurrence of conflicting utilities.
/// </summary>
public static class TailwindMerge
{
    private static readonly Dictionary<string, string> TailwindGroups = new()
    {
        // Padding
        ["p"] = "padding",
        ["px"] = "padding-x",
        ["py"] = "padding-y",
        ["pt"] = "padding-top",
        ["pr"] = "padding-right",
        ["pb"] = "padding-bottom",
        ["pl"] = "padding-left",

        // Margin
        ["m"] = "margin",
        ["mx"] = "margin-x",
        ["my"] = "margin-y",
        ["mt"] = "margin-top",
        ["mr"] = "margin-right",
        ["mb"] = "margin-bottom",
        ["ml"] = "margin-left",

        // Width
        ["w"] = "width",
        ["min-w"] = "min-width",
        ["max-w"] = "max-width",

        // Height
        ["h"] = "height",
        ["min-h"] = "min-height",
        ["max-h"] = "max-height",

        // Font Size
        ["text-xs"] = "font-size",
        ["text-sm"] = "font-size",
        ["text-base"] = "font-size",
        ["text-lg"] = "font-size",
        ["text-xl"] = "font-size",
        ["text-2xl"] = "font-size",
        ["text-3xl"] = "font-size",
        ["text-4xl"] = "font-size",
        ["text-5xl"] = "font-size",
        ["text-6xl"] = "font-size",
        ["text-7xl"] = "font-size",
        ["text-8xl"] = "font-size",
        ["text-9xl"] = "font-size",

        // Font Weight
        ["font-thin"] = "font-weight",
        ["font-extralight"] = "font-weight",
        ["font-light"] = "font-weight",
        ["font-normal"] = "font-weight",
        ["font-medium"] = "font-weight",
        ["font-semibold"] = "font-weight",
        ["font-bold"] = "font-weight",
        ["font-extrabold"] = "font-weight",
        ["font-black"] = "font-weight",

        // Display
        ["block"] = "display",
        ["inline-block"] = "display",
        ["inline"] = "display",
        ["flex"] = "display",
        ["inline-flex"] = "display",
        ["grid"] = "display",
        ["inline-grid"] = "display",
        ["hidden"] = "display",

        // Position
        ["static"] = "position",
        ["fixed"] = "position",
        ["absolute"] = "position",
        ["relative"] = "position",
        ["sticky"] = "position",

        // Gap
        ["gap"] = "gap",
        ["gap-x"] = "gap-x",
        ["gap-y"] = "gap-y",

        // Flex Direction
        ["flex-row"] = "flex-direction",
        ["flex-row-reverse"] = "flex-direction",
        ["flex-col"] = "flex-direction",
        ["flex-col-reverse"] = "flex-direction",

        // Text Align - a separate axis from text COLOUR, which the bare `text-([a-z]+)` pattern
        // below would otherwise sweep these into. Left ungrouped that way, `text-right` and
        // `text-muted-foreground` conflicted, so setting a colour on a cell silently un-aligned it
        // and setting an alignment silently uncoloured it (met while fixing TR-031).
        ["text-left"] = "text-align",
        ["text-center"] = "text-align",
        ["text-right"] = "text-align",
        ["text-justify"] = "text-align",
        ["text-start"] = "text-align",
        ["text-end"] = "text-align",

        // Text Overflow and Text Wrap - two more bare `text-*` axes that are not colours. Left out
        // of this table they matched the colour pattern as well, so `text-ellipsis` deleted a
        // Badge's `text-foreground` under Truncate, and `text-nowrap` / `text-balance` would
        // silently uncolour anything they were paired with (TfLens TR-038).
        ["text-ellipsis"] = "text-overflow",
        ["text-clip"] = "text-overflow",
        ["text-wrap"] = "text-wrap",
        ["text-nowrap"] = "text-wrap",
        ["text-balance"] = "text-wrap",
        ["text-pretty"] = "text-wrap",

        // Flex Wrap - a separate axis from flex-direction. Without this group,
        // "flex-wrap flex-nowrap" left both classes live and the cascade (not the caller)
        // picked the winner, so a nowrap override was silently inert (TR-027).
        ["flex-wrap"] = "flex-wrap",
        ["flex-nowrap"] = "flex-wrap",
        ["flex-wrap-reverse"] = "flex-wrap",

        // Justify Content
        ["justify-start"] = "justify-content",
        ["justify-end"] = "justify-content",
        ["justify-center"] = "justify-content",
        ["justify-between"] = "justify-content",
        ["justify-around"] = "justify-content",
        ["justify-evenly"] = "justify-content",

        // Align Items
        ["items-start"] = "align-items",
        ["items-end"] = "align-items",
        ["items-center"] = "align-items",
        ["items-baseline"] = "align-items",
        ["items-stretch"] = "align-items",

        // Border Radius
        ["rounded-none"] = "border-radius",
        ["rounded-sm"] = "border-radius",
        ["rounded"] = "border-radius",
        ["rounded-md"] = "border-radius",
        ["rounded-lg"] = "border-radius",
        ["rounded-xl"] = "border-radius",
        ["rounded-2xl"] = "border-radius",
        ["rounded-3xl"] = "border-radius",
        ["rounded-full"] = "border-radius",

        // Opacity
        ["opacity"] = "opacity",

        // Z-Index
        ["z"] = "z-index",
    };

    private static readonly Regex SpacingRegex = new(@"^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(\d+\.?\d*|auto)$", RegexOptions.Compiled);
    private static readonly Regex SizingRegex = new(@"^(w|h|min-w|min-h|max-w|max-h)-(.+)$", RegexOptions.Compiled);
    private static readonly Regex GapRegex = new(@"^(gap|gap-x|gap-y)-(\d+\.?\d*)$", RegexOptions.Compiled);
    private static readonly Regex TextColorRegex = new(@"^text-([a-z]+)(?:-(\d+))?$", RegexOptions.Compiled);
    private static readonly Regex BgColorRegex = new(@"^bg-([a-z]+)(?:-(\d+))?$", RegexOptions.Compiled);
    private static readonly Regex BorderColorRegex = new(@"^border-([a-z]+)(?:-(\d+))?$", RegexOptions.Compiled);
    private static readonly Regex BorderWidthRegex = new(@"^border(-\d+)?$", RegexOptions.Compiled);
    private static readonly Regex OpacityRegex = new(@"^opacity-(\d+)$", RegexOptions.Compiled);
    private static readonly Regex ZIndexRegex = new(@"^z-(\d+|auto)$", RegexOptions.Compiled);
    private static readonly Regex GridColsRegex = new(@"^grid-cols-(\d+|none)$", RegexOptions.Compiled);
    private static readonly Regex GridRowsRegex = new(@"^grid-rows-(\d+|none)$", RegexOptions.Compiled);

    // Cache for utility group lookups to avoid repeated regex evaluation
    private static readonly ConcurrentDictionary<string, string?> objUtilityGroupCache = new();

    // Characters allowed OUTSIDE an arbitrary-value bracket - alphanumeric, hyphens, underscores,
    // colons, slashes, brackets, dots, percentages, and CSS combinator characters.
    // This covers Tailwind classes like "w-1/2", "hover:bg-blue-500", "text-[14px]", "[&>svg]:absolute".
    private static readonly Regex ValidClassNameRegex = new(@"^[a-zA-Z0-9_\-:/.[\]()%!@#&>+~=]+$", RegexOptions.Compiled);

    // The same set plus the characters a real arbitrary VALUE needs: quotes, comma, semicolon,
    // asterisk, comparison and currency signs, and whitespace escaped as an underscore (already
    // allowed above). Only ever applied to the text between '[' and ']' - see IsValidClassName.
    private static readonly Regex ValidArbitraryValueRegex = new(@"^[a-zA-Z0-9_\-:/.,;'""[\]()%!@#&>+~=*$?|^{} ]*$", RegexOptions.Compiled);

    // Substrings that are never legitimate in a class name, at any depth.
    private static readonly string[] DangerousFragments =
    [
        "expression(",
        "javascript:",
        "@import",
        "url(javascript",
        "url(data:text/html",
    ];

    /// <summary>
    /// Validates that a CSS class name contains only safe characters.
    /// Rejects classes that could be used for CSS injection attacks.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Tailwind arbitrary values - the text between <c>[</c> and <c>]</c> - legitimately carry
    /// characters no plain utility needs: quotes, commas and semicolons inside a data URI, for
    /// example. The two charsets are therefore applied to different parts of the class, rather
    /// than one strict charset to the whole of it.
    /// </para>
    /// <para>
    /// This is why <c>url(</c> is no longer a blanket rejection (TfLens TR-032). The guard used to
    /// drop any class containing it, which silently deleted the library's OWN chevron class on
    /// <see cref="NativeSelect"/> - <c>bg-[url('data:image/svg+xml;...')]</c> - so the control shipped
    /// with <c>appearance-none</c> and no arrow at all. A consumer passing any arbitrary value with a
    /// <c>url()</c> in it lost the class the same way, with no warning. Only the payload forms that
    /// could actually execute (<c>url(javascript</c>, <c>url(data:text/html</c>) are rejected now.
    /// </para>
    /// <para>
    /// Class names are emitted into a <c>class</c> attribute that Blazor HTML-encodes, so a class
    /// name cannot break out of the attribute; these checks are defence in depth over that.
    /// </para>
    /// </remarks>
    private static bool IsValidClassName(string className)
    {
        if (string.IsNullOrWhiteSpace(className) || className.Length > 500)
        {
            return false;
        }

        foreach (var vFragment in DangerousFragments)
        {
            if (className.Contains(vFragment, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        // Walk the class once, validating the bracketed arbitrary values against the wider
        // charset and everything outside them against the strict one.
        var vDepth = 0;
        var vSegmentStart = 0;

        for (var i = 0; i < className.Length; i++)
        {
            var vChar = className[i];

            if (vChar == '[')
            {
                if (vDepth == 0)
                {
                    if (!IsValidOutsideBrackets(className[vSegmentStart..i]))
                    {
                        return false;
                    }
                    vSegmentStart = i + 1;
                }
                vDepth++;
            }
            else if (vChar == ']')
            {
                vDepth--;
                if (vDepth < 0)
                {
                    return false;
                }
                if (vDepth == 0)
                {
                    if (!ValidArbitraryValueRegex.IsMatch(className[vSegmentStart..i]))
                    {
                        return false;
                    }
                    vSegmentStart = i + 1;
                }
            }
        }

        return vDepth == 0 && IsValidOutsideBrackets(className[vSegmentStart..]);
    }

    /// <summary>
    /// Validates one stretch of a class name that lies outside any arbitrary-value bracket.
    /// </summary>
    private static bool IsValidOutsideBrackets(string segment) =>
        segment.Length == 0 || ValidClassNameRegex.IsMatch(segment);

    /// <summary>
    /// Merges an array of CSS class strings, resolving Tailwind utility conflicts.
    /// Later classes in the array take precedence over earlier ones when conflicts occur.
    /// </summary>
    /// <param name="classes">Array of class strings to merge</param>
    /// <returns>Merged class string with conflicts resolved</returns>
    public static string Merge(string[] classes)
    {
        if (classes == null || classes.Length == 0)
        {
            return string.Empty;
        }

        // Dictionary to track the last occurrence of each utility group
        var groupedClasses = new Dictionary<string, (string className, int index)>();
        var unGroupedClasses = new List<(string className, int index)>();

        for (var i = 0; i < classes.Length; i++)
        {
            var className = classes[i];
            if (string.IsNullOrWhiteSpace(className))
            {
                continue;
            }

            // Skip potentially dangerous class names
            if (!IsValidClassName(className))
            {
                continue;
            }

            var group = GetUtilityGroup(className);
            if (!string.IsNullOrEmpty(group))
            {
                // This class belongs to a known utility group
                // Store it with its index, replacing any previous occurrence from the same group
                groupedClasses[group] = (className, i);
            }
            else
            {
                // Unknown utility or custom class - preserve it
                unGroupedClasses.Add((className, i));
            }
        }

        // Combine grouped and ungrouped classes, maintaining relative order
        var allClasses = groupedClasses.Values
            .Concat(unGroupedClasses)
            .OrderBy(x => x.index)
            .Select(x => x.className);

        return string.Join(" ", allClasses);
    }

    /// <summary>
    /// Identifies which utility group a class belongs to.
    /// Returns null if the class doesn't match any known Tailwind utility pattern.
    /// Results are cached for performance.
    /// </summary>
    private static string? GetUtilityGroup(string className) =>
        objUtilityGroupCache.GetOrAdd(className, ComputeUtilityGroup);

    /// <summary>
    /// Computes the utility group for a class name.
    /// This is the uncached implementation called by GetUtilityGroup.
    /// </summary>
    private static string? ComputeUtilityGroup(string className)
    {
        // Variants participate in the group key. Without this, "lg:text-5xl" is an unknown
        // utility that survives every merge, so a consumer's "text-2xl" replaces the base size
        // and the lg: size still wins above the breakpoint - which is exactly the "the Class
        // override silently does nothing" trap. Two "lg:text-*" classes now conflict with each
        // other, and "lg:text-*" no longer conflicts with an unprefixed "text-*".
        var (vModifiers, vBaseClass) = SplitModifiers(className);
        var vGroup = ComputeBaseUtilityGroup(vBaseClass);

        if (vGroup == null)
        {
            return null;
        }

        return vModifiers.Length == 0 ? vGroup : vModifiers + vGroup;
    }

    /// <summary>
    /// Splits a class name into its variant prefix (for example <c>lg:hover:</c>) and the base
    /// utility. Colons inside square brackets - arbitrary values such as
    /// <c>data-[state=open]:block</c> - are not separators.
    /// </summary>
    private static (string Modifiers, string BaseClass) SplitModifiers(string className)
    {
        var vDepth = 0;
        var vLastColon = -1;

        for (var i = 0; i < className.Length; i++)
        {
            var vChar = className[i];

            if (vChar == '[')
            {
                vDepth++;
            }
            else if (vChar == ']')
            {
                vDepth--;
            }
            else if (vChar == ':' && vDepth == 0)
            {
                vLastColon = i;
            }
        }

        return vLastColon < 0
            ? (string.Empty, className)
            : (className[..(vLastColon + 1)], className[(vLastColon + 1)..]);
    }

    /// <summary>
    /// Computes the utility group for a class name with its variant prefix already removed.
    /// </summary>
    private static string? ComputeBaseUtilityGroup(string className)
    {
        // Check exact matches first (display, position, etc.)
        if (TailwindGroups.TryGetValue(className, out var group))
        {
            return group;
        }

        // Check spacing utilities (padding, margin) - use Match directly to avoid double evaluation
        var spacingMatch = SpacingRegex.Match(className);
        if (spacingMatch.Success)
        {
            var prefix = spacingMatch.Groups[1].Value;
            return TailwindGroups.TryGetValue(prefix, out var spacingGroup) ? spacingGroup : null;
        }

        // Check sizing utilities (width, height, min/max)
        var sizingMatch = SizingRegex.Match(className);
        if (sizingMatch.Success)
        {
            var prefix = sizingMatch.Groups[1].Value;
            return TailwindGroups.TryGetValue(prefix, out var sizingGroup) ? sizingGroup : null;
        }

        // Check gap utilities
        var gapMatch = GapRegex.Match(className);
        if (gapMatch.Success)
        {
            var prefix = gapMatch.Groups[1].Value;
            return TailwindGroups.TryGetValue(prefix, out var gapGroup) ? gapGroup : null;
        }

        // Check text colors
        if (TextColorRegex.IsMatch(className))
        {
            return "text-color";
        }

        // Check background colors
        if (BgColorRegex.IsMatch(className))
        {
            return "background-color";
        }

        // Check border colors
        if (BorderColorRegex.IsMatch(className))
        {
            return "border-color";
        }

        // Check border width
        if (BorderWidthRegex.IsMatch(className))
        {
            return "border-width";
        }

        // Check opacity
        if (OpacityRegex.IsMatch(className))
        {
            return "opacity";
        }

        // Check z-index
        if (ZIndexRegex.IsMatch(className))
        {
            return "z-index";
        }

        // Check grid columns
        if (GridColsRegex.IsMatch(className))
        {
            return "grid-cols";
        }

        // Check grid rows
        if (GridRowsRegex.IsMatch(className))
        {
            return "grid-rows";
        }

        // Unknown utility
        return null;
    }
}
