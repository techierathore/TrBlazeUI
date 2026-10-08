namespace TrBlazeUI.Components.Toast;

/// <summary>
/// Service for managing toast notifications.
/// Register as a singleton or scoped service in DI.
/// </summary>
public class ToastService
{
    private readonly List<ToastData> objToasts = new();

    /// <summary>
    /// Event fired when the toast collection changes.
    /// </summary>
    public event Action? OnChange;

    /// <summary>
    /// Gets the current list of toasts.
    /// </summary>
    public IReadOnlyList<ToastData> Toasts => objToasts.AsReadOnly();

    /// <summary>
    /// Shows a toast notification.
    /// </summary>
    /// <param name="toast">The toast data to display.</param>
    public void Show(ToastData toast)
    {
        objToasts.Add(toast);
        OnChange?.Invoke();
    }

    /// <summary>
    /// Shows a simple toast with a message.
    /// </summary>
    /// <param name="description">The message to display.</param>
    /// <param name="title">Optional title.</param>
    /// <param name="variant">The visual variant.</param>
    /// <param name="duration">Duration in milliseconds (default 5000).</param>
    public void Show(string description, string? title = null, ToastVariant variant = ToastVariant.Default, int duration = 5000)
    {
        Show(new ToastData
        {
            Title = title,
            Description = description,
            Variant = variant,
            Duration = duration
        });
    }

    /// <summary>
    /// Shows a success toast. It keeps the <see cref="ToastVariant.Default"/> look it has always
    /// had; pass <see cref="ToastVariant.Success"/> to <see cref="Show(string, string?, ToastVariant, int)"/>
    /// for the tinted green surface.
    /// </summary>
    /// <param name="description">The message to display.</param>
    /// <param name="title">Optional title.</param>
    public void Success(string description, string? title = null) =>
        Show(description, title, ToastVariant.Default);

    /// <summary>
    /// Shows an error toast (destructive variant).
    /// </summary>
    /// <param name="description">The message to display.</param>
    /// <param name="title">Optional title.</param>
    public void Error(string description, string? title = null) =>
        Show(description, title, ToastVariant.Destructive);

    /// <summary>
    /// Shows a warning toast (<see cref="ToastVariant.Warning"/>): a caution about an operation
    /// that succeeded, which neither <see cref="Success"/> nor <see cref="Error"/> conveys
    /// (Sevak TR-023).
    /// </summary>
    /// <param name="description">The message to display.</param>
    /// <param name="title">Optional title.</param>
    public void Warning(string description, string? title = null) =>
        Show(description, title, ToastVariant.Warning);

    /// <summary>
    /// Shows an informational toast (<see cref="ToastVariant.Info"/>).
    /// </summary>
    /// <param name="description">The message to display.</param>
    /// <param name="title">Optional title.</param>
    public void Info(string description, string? title = null) =>
        Show(description, title, ToastVariant.Info);

    /// <summary>
    /// Dismisses a specific toast by ID.
    /// </summary>
    /// <param name="id">The toast ID to dismiss.</param>
    public void Dismiss(string id)
    {
        var toast = objToasts.FirstOrDefault(t => t.Id == id);
        if (toast != null)
        {
            objToasts.Remove(toast);
            OnChange?.Invoke();
        }
    }

    /// <summary>
    /// Dismisses all toasts.
    /// </summary>
    public void DismissAll()
    {
        objToasts.Clear();
        OnChange?.Invoke();
    }
}
