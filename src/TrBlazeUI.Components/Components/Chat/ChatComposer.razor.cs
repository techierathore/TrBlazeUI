using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using TrBlazeUI.Components.Utilities;

namespace TrBlazeUI.Components.Chat;

/// <summary>
/// The box a chat message is written in: optional controls above it, a text area that grows with
/// its content up to a cap, and a send button.
/// </summary>
/// <remarks>
/// <para>
/// Enter sends and Shift+Enter inserts a newline; that decision has to be made synchronously in the
/// browser, so a small script (<c>chat-composer.js</c>) handles the key and calls back into .NET.
/// After a send the box is emptied in the DOM as well as in <see cref="Value"/>, because the text
/// control defers a parent's new value while it keeps focus (Sevak TR-006, TR-025).
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;ChatComposer @bind-Value="objDraft" OnSend="SendAsync" Placeholder="Ask about these documents"&gt;
///     &lt;Actions&gt;&lt;NativeSelect TValue="string" @bind-Value="objMode"&gt;…&lt;/NativeSelect&gt;&lt;/Actions&gt;
/// &lt;/ChatComposer&gt;
/// </code>
/// </example>
public partial class ChatComposer
{
    private readonly string objInputId = $"chat-composer-{Guid.NewGuid():N}";

    private ElementReference objRoot;

    private IJSObjectReference? objModule;

    private DotNetObjectReference<ChatComposer>? objDotNetRef;

    [Inject]
    private IJSRuntime JS { get; set; } = default!;

    /// <summary>
    /// Gets or sets the text being written. Use with <c>@bind-Value</c>.
    /// </summary>
    [Parameter]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the callback raised when the text changes, and when the box is cleared after a
    /// send.
    /// </summary>
    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>
    /// Gets or sets the callback raised with the trimmed text when the message is sent, by the
    /// button or by Enter. Empty or whitespace-only text is never sent.
    /// </summary>
    [Parameter]
    public EventCallback<string> OnSend { get; set; }

    /// <summary>
    /// Gets or sets the placeholder shown while the box is empty. Default <c>"Type a message"</c>.
    /// </summary>
    [Parameter]
    public string? Placeholder { get; set; } = "Type a message";

    /// <summary>
    /// Gets or sets the accessible name of the text box. Default <c>"Message"</c>.
    /// </summary>
    [Parameter]
    public string AriaLabel { get; set; } = "Message";

    /// <summary>
    /// Gets or sets the accessible name of the send button. Default <c>"Send"</c>.
    /// </summary>
    [Parameter]
    public string SendLabel { get; set; } = "Send";

    /// <summary>
    /// Gets or sets the starting height of the box in lines. Default 1.
    /// </summary>
    [Parameter]
    public int Rows { get; set; } = 1;

    /// <summary>
    /// Gets or sets the height in lines past which the box scrolls instead of growing. Default 12.
    /// </summary>
    [Parameter]
    public int MaxRows { get; set; } = 12;

    /// <summary>
    /// Gets or sets whether the box and the button are disabled.
    /// </summary>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets whether a send is in flight: the button shows a spinner and does not send
    /// again. The text box stays usable.
    /// </summary>
    [Parameter]
    public bool Sending { get; set; }

    /// <summary>
    /// Gets or sets whether Enter sends and Shift+Enter inserts a newline. Default true. When
    /// false, Enter inserts a newline and only the button sends.
    /// </summary>
    [Parameter]
    public bool SubmitOnEnter { get; set; } = true;

    /// <summary>
    /// Gets or sets whether the box is emptied after a send. Default true.
    /// </summary>
    [Parameter]
    public bool ClearOnSend { get; set; } = true;

    /// <summary>
    /// Gets or sets controls drawn above the text box, such as a mode picker or a microphone
    /// button.
    /// </summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes merged into the root's own.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes (id, style, data-*, aria-*, event handlers)
    /// forwarded to the rendered root element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string CssClass => ClassNames.cn(
        "rounded-md border border-input bg-background p-2",
        Class);

    /// <summary>
    /// Sends the text the box holds. Called from the browser when Enter is pressed without Shift.
    /// </summary>
    /// <param name="aText">The text in the box at the moment of the key press, which may be ahead
    /// of <see cref="Value"/> on a slow circuit.</param>
    /// <returns>A task that completes when the message has been sent.</returns>
    [JSInvokable]
    public Task SendFromKeyboardAsync(string? aText) => SendAsync(aText ?? Value);

    /// <inheritdoc />
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender || !SubmitOnEnter)
        {
            return;
        }

        try
        {
            objModule = await JS.InvokeAsync<IJSObjectReference>(
                "import", "./_content/TrBlazeUI.Components/js/chat-composer.js");
            objDotNetRef = DotNetObjectReference.Create(this);
            await objModule.InvokeVoidAsync("attach", objRoot, objDotNetRef);
        }
        catch (JSDisconnectedException)
        {
            // Expected during circuit disconnect in Blazor Server.
        }
        catch (InvalidOperationException)
        {
            // JS interop is unavailable during prerendering.
        }
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        if (objModule != null)
        {
            try
            {
                await objModule.InvokeVoidAsync("detach", objRoot);
                await objModule.DisposeAsync();
            }
            catch (JSDisconnectedException)
            {
                // Expected during circuit disconnect.
            }
            catch (TaskCanceledException)
            {
                // The page went away before it answered; the module died with it (REQ-UI-028).
            }
        }

        objDotNetRef?.Dispose();
        GC.SuppressFinalize(this);
    }

    private Task HandleValueChanged(string? aValue)
    {
        Value = aValue;
        return ValueChanged.InvokeAsync(aValue);
    }

    private Task HandleSendClickAsync(MouseEventArgs aArgs) => SendAsync(Value);

    private async Task SendAsync(string? aText)
    {
        if (Disabled || Sending)
        {
            return;
        }

        var vText = aText?.Trim();
        if (string.IsNullOrEmpty(vText))
        {
            return;
        }

        await OnSend.InvokeAsync(vText);

        if (!ClearOnSend)
        {
            return;
        }

        // The DOM first: while the box has focus the text control defers a parent's new value, so
        // Value alone would leave the sent text standing in the box (Sevak TR-025).
        if (objModule != null)
        {
            try
            {
                await objModule.InvokeVoidAsync("clear", objRoot);
            }
            catch (JSDisconnectedException)
            {
                // Expected during circuit disconnect.
            }
        }

        Value = null;
        await ValueChanged.InvokeAsync(null);
    }
}
