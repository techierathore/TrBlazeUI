using System.Globalization;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// Picks where a submenu opens and owns the script module that measures it (Chatur TR-020, TR-024).
/// Shared by MenubarSubContent, DropdownMenuSubContent and ContextMenuSubContent.
/// </summary>
internal sealed class SubmenuPlacer : IAsyncDisposable
{
    /// <summary>The classes every submenu list carries: beside its trigger row, on the right unless flipped.</summary>
    internal const string ListClasses =
        "absolute top-0 -mt-1 left-full ml-1 z-50 min-w-[8rem] rounded-md border bg-popover p-1 " +
        "text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 " +
        "data-[side=left]:left-auto data-[side=left]:right-full data-[side=left]:ml-0 data-[side=left]:mr-1";

    /// <summary>The classes every submenu trigger row carries; the ▸ sits at its right edge.</summary>
    internal const string TriggerClasses =
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm outline-none " +
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground " +
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground " +
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

    /// <summary>The classes of the ▸ at the right of a trigger row.</summary>
    internal const string ChevronClasses = "ml-auto pl-2 text-xs leading-none opacity-70";

    private IJSObjectReference? objModule;

    /// <summary>Measures an open submenu list and tells where it fits.</summary>
    /// <remarks>
    /// 1. Loads <c>submenu.js</c> once.
    /// 2. Asks it whether the list, drawn on the right, runs past the window; if so, whether the
    ///    left has room; and when neither side does, how far to pull the list back inside (TR-024).
    /// 3. Any script failure (prerender, a closed page) keeps the default right side.
    /// </remarks>
    /// <param name="aJsRuntime">The JS runtime.</param>
    /// <param name="aList">The submenu list element.</param>
    /// <returns>The side, the pull-back in pixels and the width cap.</returns>
    internal async Task<SubmenuPlacement> FitAsync(IJSRuntime aJsRuntime, ElementReference aList)
    {
        try
        {
            objModule ??= await aJsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/TrBlazeUI.Components/js/submenu.js").ConfigureAwait(false);
            var vPlacement = await objModule.InvokeAsync<SubmenuPlacement>("fit", aList).ConfigureAwait(false);
            return vPlacement ?? SubmenuPlacement.Default;
        }
        catch (JSException)
        {
            return SubmenuPlacement.Default;
        }
        catch (JSDisconnectedException)
        {
            return SubmenuPlacement.Default;
        }
        catch (TaskCanceledException)
        {
            return SubmenuPlacement.Default;
        }
        catch (InvalidOperationException)
        {
            // Prerendering: no browser to measure yet.
            return SubmenuPlacement.Default;
        }
    }

    /// <summary>Builds the inline style that pulls a list back inside the window (TR-024).</summary>
    /// <remarks>
    /// 1. A list on the right sits at <c>left: 100%</c>; the pull-back becomes <c>left: calc(100% - Npx)</c>.
    /// 2. A list on the left sits at <c>right: 100%</c>; the pull-back becomes <c>right: calc(100% - Npx)</c>.
    /// 3. A width cap becomes <c>max-width</c>, so the rows wrap instead of running off the window.
    /// 4. The caller's own <c>style</c>, if any, is kept after these.
    /// </remarks>
    /// <param name="aPlacement">The measured placement.</param>
    /// <param name="aCallerStyle">The caller's own style attribute, or null.</param>
    /// <returns>The style attribute value, or null when nothing is needed.</returns>
    internal static string? Style(SubmenuPlacement aPlacement, string? aCallerStyle)
    {
        var vParts = new List<string>();
        if (aPlacement.Offset > 0)
        {
            var vEdge = aPlacement.Side == "left" ? "right" : "left";
            vParts.Add($"{vEdge}:calc(100% - {Pixels(aPlacement.Offset)})");
        }

        if (aPlacement.MaxWidth > 0)
        {
            vParts.Add($"max-width:{Pixels(aPlacement.MaxWidth)}");
        }

        if (!string.IsNullOrWhiteSpace(aCallerStyle))
        {
            vParts.Add(aCallerStyle.Trim().TrimEnd(';'));
        }

        return vParts.Count == 0 ? null : string.Join(";", vParts);
    }

    private static string Pixels(double aValue) =>
        Math.Round(aValue, 1).ToString(CultureInfo.InvariantCulture) + "px";

    /// <summary>Releases the script module.</summary>
    /// <returns>A task that completes when the module is released.</returns>
    public async ValueTask DisposeAsync()
    {
        if (objModule == null)
        {
            return;
        }

        try
        {
            await objModule.DisposeAsync().ConfigureAwait(false);
        }
        catch (JSDisconnectedException)
        {
            // Circuit already torn down - the module died with it.
        }
        catch (TaskCanceledException)
        {
            // The page went away before it answered; the module died with it.
        }
    }
}
