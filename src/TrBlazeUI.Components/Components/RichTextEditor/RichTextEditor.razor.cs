using System.Text.Json;
using TrBlazeUI.Components.Utilities;
using Ganss.Xss;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.RichTextEditor;

/// <summary>
/// A rich text editor component built on Quill.js that follows the shadcn/ui design system.
/// </summary>
public partial class RichTextEditor : ComponentBase, IAsyncDisposable
{
    // === Private Fields ===
    private ElementReference objEditorRef;
    private IJSObjectReference? objJsModule;
    private DotNetObjectReference<RichTextEditor>? objDotNetRef;
    private string objEditorId = Guid.NewGuid().ToString("N");
    private bool objJsInitialized;
    private string? objLastKnownValue;
    private bool objPendingValueUpdate;

    // === Format State Tracking ===
    private bool objIsBold;
    private bool objIsItalic;
    private bool objIsUnderline;
    private bool objIsStrike;
    private bool objIsBulletList;
    private bool objIsOrderedList;
    private bool objIsBlockquote;
    private bool objIsCodeBlock;
    private string objHeaderLevel = "";

    // === Link Dialog State ===
    private bool objLinkDialogOpen;
    private string objLinkUrl = "";
    private string? objLinkUrlError;
    private bool objHasExistingLink;
    private EditorRange? objSavedSelection;

    // === ShouldRender Tracking ===
    private string? objLastValue;
    private bool objLastDisabled;
    private bool objLastReadOnly;
    private bool objLastLinkDialogOpen;
    private bool objFormatStateChanged;

    /// <summary>
    /// HTML sanitizer for XSS prevention. Thread-safe for static usage.
    /// </summary>
    private static readonly HtmlSanitizer Sanitizer = new();

    // === Parameters - Value Binding ===

    /// <summary>
    /// Gets or sets the HTML content of the editor.
    /// </summary>
    [Parameter]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the editor content changes.
    /// </summary>
    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>
    /// Gets or sets the Delta (JSON) representation of the editor content.
    /// </summary>
    [Parameter]
    public string? DeltaValue { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the Delta content changes.
    /// </summary>
    [Parameter]
    public EventCallback<string?> DeltaValueChanged { get; set; }

    // === Parameters - Toolbar ===

    /// <summary>
    /// Gets or sets the toolbar preset configuration.
    /// </summary>
    [Parameter]
    public ToolbarPreset Toolbar { get; set; } = ToolbarPreset.Standard;

    /// <summary>
    /// Gets or sets custom toolbar content.
    /// </summary>
    [Parameter]
    public RenderFragment? ToolbarContent { get; set; }

    // === Parameters - Appearance ===

    /// <summary>
    /// Gets or sets the placeholder text displayed when the editor is empty.
    /// </summary>
    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Gets or sets the minimum height of the editor.
    /// </summary>
    [Parameter]
    public string MinHeight { get; set; } = "150px";

    /// <summary>
    /// Gets or sets the maximum height of the editor. Content will scroll when exceeded.
    /// </summary>
    [Parameter]
    public string? MaxHeight { get; set; }

    /// <summary>
    /// Gets or sets a fixed height for the editor.
    /// </summary>
    [Parameter]
    public string? Height { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes for the container.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the HTML id attribute for the editor container.
    /// </summary>
    [Parameter]
    public string? Id { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the container element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    // === Parameters - State ===

    /// <summary>
    /// Gets or sets whether the editor is disabled.
    /// </summary>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets whether the editor is read-only.
    /// </summary>
    [Parameter]
    public bool ReadOnly { get; set; }

    // === Parameters - Accessibility ===

    /// <summary>
    /// Gets or sets the ARIA label for the editor.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the ID of the element that describes the editor.
    /// </summary>
    [Parameter]
    public string? AriaDescribedBy { get; set; }

    /// <summary>
    /// Gets or sets whether the editor value is invalid.
    /// </summary>
    [Parameter]
    public bool? AriaInvalid { get; set; }

    // === Parameters - Events ===

    /// <summary>
    /// Gets or sets the callback invoked when the editor content changes.
    /// </summary>
    [Parameter]
    public EventCallback<TextChangeEventArgs> OnTextChange { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the selection changes.
    /// </summary>
    [Parameter]
    public EventCallback<SelectionChangeEventArgs> OnSelectionChange { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the editor gains focus.
    /// </summary>
    [Parameter]
    public EventCallback OnFocus { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the editor loses focus.
    /// </summary>
    [Parameter]
    public EventCallback OnBlur { get; set; }

    // === Lifecycle Methods ===

    /// <summary>
    /// On the first render, initializes the Quill.js editor instance through JavaScript interop.
    /// </summary>
    /// <param name="firstRender">True on the first render of the component; otherwise false.</param>
    /// <returns>A task that represents the asynchronous post-render operation.</returns>
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            await InitializeJsAsync();
        }
    }

    /// <summary>
    /// Reacts to (re)assigned parameters by pushing an externally changed <see cref="Value"/> into
    /// the initialized editor so its HTML content stays in sync with the bound value.
    /// </summary>
    /// <returns>A task that represents the asynchronous parameter-processing operation.</returns>
    protected override async Task OnParametersSetAsync()
    {
        // If Value changed externally, update the editor
        if (objJsInitialized && Value != objLastKnownValue && !objPendingValueUpdate)
        {
            objPendingValueUpdate = true;
            try
            {
                await SetHtmlAsync(Value);
                objLastKnownValue = Value;
            }
            finally
            {
                objPendingValueUpdate = false;
            }
        }
    }

    private async Task InitializeJsAsync()
    {
        if (objJsInitialized)
        {
            return;
        }

        try
        {
            objJsModule = await JS.InvokeAsync<IJSObjectReference>("import",
                "./_content/TrBlazeUI.Components/js/quill-interop.js");
            objDotNetRef = DotNetObjectReference.Create(this);

            var options = BuildEditorOptions();
            await objJsModule.InvokeVoidAsync("initializeEditor",
                objEditorRef, objDotNetRef, objEditorId, options);
            objJsInitialized = true;

            // Set initial content (sanitized to prevent XSS)
            if (!string.IsNullOrEmpty(Value))
            {
                var sanitized = Sanitizer.Sanitize(Value);
                await objJsModule.InvokeVoidAsync("setHtml", objEditorId, sanitized);
                objLastKnownValue = Value;
            }

            // Apply disabled state
            if (Disabled)
            {
                await objJsModule.InvokeVoidAsync("disable", objEditorId);
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Failed to initialize RichTextEditor JS: {ex.Message}");
        }
    }

    // === JSInvokable Callbacks ===

    /// <summary>
    /// Handles text change events raised by the underlying Quill editor through JS interop,
    /// updating the bound HTML and Delta values and notifying subscribers.
    /// </summary>
    /// <param name="args">The text change event data containing the updated HTML and Delta content.</param>
    /// <returns>A task that represents the asynchronous callback operation.</returns>
    [JSInvokable]
    public async Task OnTextChangeCallback(TextChangeEventArgs args)
    {
        objLastKnownValue = args.Html;
        Value = args.Html;
        await ValueChanged.InvokeAsync(args.Html);

        DeltaValue = args.Delta;
        await DeltaValueChanged.InvokeAsync(args.Delta);

        await OnTextChange.InvokeAsync(args);
    }

    /// <summary>
    /// Handles selection change events raised by the underlying Quill editor through JS interop,
    /// synchronizing the toolbar format state and raising focus/blur callbacks as the selection enters or leaves the editor.
    /// </summary>
    /// <param name="args">The selection change event data containing the new and previous ranges and the active format.</param>
    /// <returns>A task that represents the asynchronous callback operation.</returns>
    [JSInvokable]
    public async Task OnSelectionChangeCallback(SelectionChangeEventArgs args)
    {
        // Update format state from selection
        if (args.Format != null)
        {
            UpdateFormatState(args.Format);
        }

        // Detect focus/blur from selection (null range = lost focus)
        if (args.Range == null && args.OldRange != null)
        {
            await OnBlur.InvokeAsync();
        }
        else if (args.Range != null && args.OldRange == null)
        {
            await OnFocus.InvokeAsync();
        }

        await OnSelectionChange.InvokeAsync(args);
    }

    private static bool GetFormatBool(Dictionary<string, object?> format, string key)
    {
        if (!format.TryGetValue(key, out var value) || value == null)
        {
            return false;
        }

        if (value is bool b)
        {
            return b;
        }

        if (value is JsonElement je && je.ValueKind == JsonValueKind.True)
        {
            return true;
        }

        return false;
    }

    private static string GetFormatString(Dictionary<string, object?> format, string key)
    {
        if (!format.TryGetValue(key, out var value) || value == null)
        {
            return "";
        }

        if (value is string s)
        {
            return s;
        }

        if (value is JsonElement je)
        {
            if (je.ValueKind == JsonValueKind.String)
            {
                return je.GetString() ?? "";
            }
            if (je.ValueKind == JsonValueKind.Number)
            {
                return je.GetInt32().ToString(System.Globalization.CultureInfo.InvariantCulture);
            }
        }

        return value.ToString() ?? "";
    }

    // === Toolbar Actions ===

    private async Task ToggleFormatAsync(string format, object? value = null)
    {
        if (objJsModule == null || !objJsInitialized || Disabled)
        {
            return;
        }

        // Toggle: if already active, remove; otherwise apply
        var isActive = format switch
        {
            "bold" => objIsBold,
            "italic" => objIsItalic,
            "underline" => objIsUnderline,
            "strike" => objIsStrike,
            "blockquote" => objIsBlockquote,
            "code-block" => objIsCodeBlock,
            "list" when value?.ToString() == "bullet" => objIsBulletList,
            "list" when value?.ToString() == "ordered" => objIsOrderedList,
            _ => false
        };

        var newValue = isActive ? false : (value ?? true);

        // Use formatAndGetState for all formats to ensure immediate state sync
        var formatState = await objJsModule.InvokeAsync<Dictionary<string, object?>>(
            "formatAndGetState", objEditorId, format, newValue);
        UpdateFormatState(formatState);

        // Refocus the editor after toolbar button click
        await objJsModule.InvokeVoidAsync("focus", objEditorId);
    }

    private void UpdateFormatState(Dictionary<string, object?> format)
    {
        if (format == null)
        {
            return;
        }

        objIsBold = GetFormatBool(format, "bold");
        objIsItalic = GetFormatBool(format, "italic");
        objIsUnderline = GetFormatBool(format, "underline");
        objIsStrike = GetFormatBool(format, "strike");
        objIsBlockquote = GetFormatBool(format, "blockquote");
        objIsCodeBlock = GetFormatBool(format, "code-block");

        var listValue = GetFormatString(format, "list");
        objIsBulletList = listValue == "bullet";
        objIsOrderedList = listValue == "ordered";

        objHeaderLevel = GetFormatString(format, "header");

        // Mark format state as changed for ShouldRender optimization
        objFormatStateChanged = true;
        StateHasChanged();
    }

    /// <summary>
    /// Determines whether the component should re-render based on tracked state changes.
    /// This optimization reduces unnecessary render cycles from bidirectional binding.
    /// </summary>
    protected override bool ShouldRender()
    {
        var valueChanged = objLastValue != Value;
        var disabledChanged = objLastDisabled != Disabled;
        var readOnlyChanged = objLastReadOnly != ReadOnly;
        var dialogChanged = objLastLinkDialogOpen != objLinkDialogOpen;

        if (valueChanged || disabledChanged || readOnlyChanged || dialogChanged || objFormatStateChanged)
        {
            objLastValue = Value;
            objLastDisabled = Disabled;
            objLastReadOnly = ReadOnly;
            objLastLinkDialogOpen = objLinkDialogOpen;
            objFormatStateChanged = false;
            return true;
        }

        return false;
    }

    private async Task HandleHeaderChangeAsync(string? value)
    {
        if (objJsModule == null || !objJsInitialized || Disabled)
        {
            return;
        }

        objHeaderLevel = value ?? "";

        if (string.IsNullOrEmpty(value))
        {
            await objJsModule.InvokeVoidAsync("format", objEditorId, "header", false);
        }
        else
        {
            await objJsModule.InvokeVoidAsync("format", objEditorId, "header", int.Parse(value, System.Globalization.CultureInfo.InvariantCulture));
        }

        // Refocus the editor after dropdown change
        await objJsModule.InvokeVoidAsync("focus", objEditorId);
    }

    private async Task InsertLinkAsync()
    {
        if (objJsModule == null || !objJsInitialized || Disabled)
        {
            return;
        }

        // Save the current selection before opening dialog
        objSavedSelection = await GetSelectionAsync();

        // Check if there's already a link at the selection
        var format = await objJsModule.InvokeAsync<Dictionary<string, object?>>("getFormat", objEditorId);
        object? linkValue = null;
        objHasExistingLink = format != null && format.TryGetValue("link", out linkValue) && linkValue != null;

        if (objHasExistingLink)
        {
            if (linkValue is string existingUrl)
            {
                objLinkUrl = existingUrl;
            }
            else if (linkValue is System.Text.Json.JsonElement je && je.ValueKind == System.Text.Json.JsonValueKind.String)
            {
                objLinkUrl = je.GetString() ?? "https://";
            }
            else
            {
                objLinkUrl = "https://";
            }
        }
        else
        {
            objLinkUrl = "https://";
        }

        objLinkUrlError = null;
        objLinkDialogOpen = true;
    }

    private void CloseLinkDialog()
    {
        objLinkDialogOpen = false;
        objLinkUrl = "";
        objLinkUrlError = null;
        objSavedSelection = null;
    }

    private void ValidateLinkUrl()
    {
        if (string.IsNullOrWhiteSpace(objLinkUrl) || objLinkUrl == "https://")
        {
            objLinkUrlError = null;
        }
        else if (!IsValidUrl(objLinkUrl))
        {
            objLinkUrlError = "Please enter a valid URL";
        }
        else
        {
            objLinkUrlError = null;
        }
    }

    private static bool IsValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url) || url == "https://")
        {
            return false;
        }

        return Uri.TryCreate(url, UriKind.Absolute, out var uri)
               && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }

    private async Task ApplyLinkAsync()
    {
        if (objJsModule == null || !objJsInitialized || !IsValidUrl(objLinkUrl))
        {
            return;
        }

        // Restore selection before applying link
        if (objSavedSelection != null)
        {
            await SetSelectionAsync(objSavedSelection.Index, objSavedSelection.Length);
        }

        await objJsModule.InvokeVoidAsync("format", objEditorId, "link", objLinkUrl);

        CloseLinkDialog();
        await objJsModule.InvokeVoidAsync("focus", objEditorId);
    }

    private async Task RemoveLinkAsync()
    {
        if (objJsModule == null || !objJsInitialized)
        {
            return;
        }

        // Restore selection before removing link
        if (objSavedSelection != null)
        {
            await SetSelectionAsync(objSavedSelection.Index, objSavedSelection.Length);
        }

        await objJsModule.InvokeVoidAsync("format", objEditorId, "link", false);

        CloseLinkDialog();
        await objJsModule.InvokeVoidAsync("focus", objEditorId);
    }

    // === Public API Methods ===

    /// <summary>
    /// Focuses the editor.
    /// </summary>
    public async Task FocusAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            await objJsModule.InvokeVoidAsync("focus", objEditorId);
        }
    }

    /// <summary>
    /// Removes focus from the editor.
    /// </summary>
    public async Task BlurAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            await objJsModule.InvokeVoidAsync("blur", objEditorId);
        }
    }

    /// <summary>
    /// Gets the current selection range.
    /// </summary>
    public async Task<EditorRange?> GetSelectionAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            return await objJsModule.InvokeAsync<EditorRange?>("getSelection", objEditorId);
        }
        return null;
    }

    /// <summary>
    /// Sets the selection range.
    /// </summary>
    public async Task SetSelectionAsync(int index, int length = 0)
    {
        if (objJsModule != null && objJsInitialized)
        {
            await objJsModule.InvokeVoidAsync("setSelection", objEditorId, index, length);
        }
    }

    /// <summary>
    /// Applies formatting to the current selection.
    /// </summary>
    public async Task FormatAsync(string formatName, object? value = null)
    {
        if (objJsModule != null && objJsInitialized)
        {
            await objJsModule.InvokeVoidAsync("format", objEditorId, formatName, value ?? true);
        }
    }

    /// <summary>
    /// Gets the plain text content of the editor.
    /// </summary>
    public async Task<string> GetTextAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            return await objJsModule.InvokeAsync<string>("getText", objEditorId) ?? "";
        }
        return "";
    }

    /// <summary>
    /// Gets the length of the editor content.
    /// </summary>
    public async Task<int> GetLengthAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            return await objJsModule.InvokeAsync<int>("getLength", objEditorId);
        }
        return 0;
    }

    /// <summary>
    /// Gets the HTML content of the editor.
    /// </summary>
    public async Task<string> GetHtmlAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            return await objJsModule.InvokeAsync<string>("getHtml", objEditorId) ?? "";
        }
        return "";
    }

    /// <summary>
    /// Sets the HTML content of the editor.
    /// HTML is sanitized to prevent XSS attacks.
    /// </summary>
    public async Task SetHtmlAsync(string? html)
    {
        if (objJsModule != null && objJsInitialized)
        {
            var sanitized = string.IsNullOrEmpty(html) ? "" : Sanitizer.Sanitize(html);
            await objJsModule.InvokeVoidAsync("setHtml", objEditorId, sanitized);
        }
    }

    /// <summary>
    /// Gets the Delta (JSON) content of the editor.
    /// Delta is Quill's native document format that preserves all formatting information.
    /// </summary>
    public async Task<string> GetDeltaAsync()
    {
        if (objJsModule != null && objJsInitialized)
        {
            return await objJsModule.InvokeAsync<string>("getContents", objEditorId) ?? "{}";
        }
        return "{}";
    }

    /// <summary>
    /// Sets the editor content using a Delta (JSON) object.
    /// This is the preferred method when working with Quill's native format.
    /// </summary>
    public async Task SetDeltaAsync(string? deltaJson)
    {
        if (objJsModule != null && objJsInitialized)
        {
            if (string.IsNullOrEmpty(deltaJson))
            {
                await objJsModule.InvokeVoidAsync("setContents", objEditorId, "{\"ops\":[{\"insert\":\"\\n\"}]}");
            }
            else
            {
                await objJsModule.InvokeVoidAsync("setContents", objEditorId, deltaJson);
            }
        }
    }

    // === Private Helper Methods ===

    private object BuildEditorOptions() => new
    {
        placeholder = Placeholder ?? "",
        readOnly = Disabled || ReadOnly
    };

    // === CSS Classes ===

    private string ContainerCssClass => ClassNames.cn(
        "flex flex-col rounded-md border border-input bg-background",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        ClassNames.when(AriaInvalid == true, "border-destructive ring-destructive/20"),
        ClassNames.when(Disabled, "opacity-50 cursor-not-allowed"),
        Class
    );

    private static string ToolbarCssClass => ClassNames.cn(
        "flex flex-wrap items-center gap-1 px-3 py-2 border-b border-input bg-muted/40"
    );

    private string EditorCssClass => ClassNames.cn(
        "text-base md:text-sm",
        ClassNames.when(Disabled, "cursor-not-allowed")
    );

    private string EditorStyle
    {
        get
        {
            var styles = new List<string>();

            if (!string.IsNullOrEmpty(Height))
            {
                styles.Add($"height: {Height}");
                styles.Add("overflow-y: auto");
            }
            else
            {
                styles.Add($"min-height: {MinHeight}");
                if (!string.IsNullOrEmpty(MaxHeight))
                {
                    styles.Add($"max-height: {MaxHeight}");
                    styles.Add("overflow-y: auto");
                }
            }

            return string.Join("; ", styles);
        }
    }

    // === Dispose ===

    /// <summary>
    /// Asynchronously disposes the editor, tearing down the Quill instance and releasing the
    /// JavaScript module and .NET object references.
    /// </summary>
    /// <returns>A task that represents the asynchronous dispose operation.</returns>
    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
        if (objJsModule != null && objJsInitialized)
        {
            try
            {
                await objJsModule.InvokeVoidAsync("disposeEditor", objEditorId);
                await objJsModule.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Expected during circuit disconnect in Blazor Server - safe to ignore
            }
            catch (ObjectDisposedException)
            {
                // Module already disposed - safe to ignore
            }
            catch (InvalidOperationException)
            {
                // JS interop not available (prerendering) - safe to ignore
            }
        }
        objDotNetRef?.Dispose();
    }
}
