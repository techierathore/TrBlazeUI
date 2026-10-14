using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Utilities;

/// <summary>
/// Picks the side a submenu opens on and owns the script module that measures it (Chatur TR-020).
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
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none " +
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground " +
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground " +
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

    /// <summary>The classes of the ▸ at the right of a trigger row.</summary>
    internal const string ChevronClasses = "ml-auto pl-2 text-xs leading-none opacity-70";

    private IJSObjectReference? objModule;

    /// <summary>Measures an open submenu list and tells the side it fits on.</summary>
    /// <remarks>
    /// 1. Loads <c>submenu.js</c> once.
    /// 2. Asks it whether the list, drawn on the right, runs past the window.
    /// 3. Any script failure (prerender, a closed page) keeps the default right side.
    /// </remarks>
    /// <param name="aJsRuntime">The JS runtime.</param>
    /// <param name="aList">The submenu list element.</param>
    /// <returns>"left" or "right".</returns>
    internal async Task<string> FitAsync(IJSRuntime aJsRuntime, ElementReference aList)
    {
        try
        {
            objModule ??= await aJsRuntime.InvokeAsync<IJSObjectReference>(
                "import", "./_content/TrBlazeUI.Components/js/submenu.js");
            return await objModule.InvokeAsync<string>("fitSide", aList);
        }
        catch (JSException)
        {
            return "right";
        }
        catch (JSDisconnectedException)
        {
            return "right";
        }
        catch (TaskCanceledException)
        {
            return "right";
        }
        catch (InvalidOperationException)
        {
            // Prerendering: no browser to measure yet.
            return "right";
        }
    }

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
            await objModule.DisposeAsync();
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
