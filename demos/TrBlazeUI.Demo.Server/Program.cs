using TrBlazeUI.Demo.Extensions;
using TrBlazeUI.Demo.Server;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add all demo services via shared extension method
builder.Services.AddTrBlazeUIDemo();

var app = builder.Build();

// Log fire-and-forget failures the way a production host does, so a component that leaks one is
// visible in the server log instead of vanishing at the next GC (TfLens TR-039).
var vUnobservedLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("UnobservedTask");
var vLogUnobserved = LoggerMessage.Define(LogLevel.Error, new EventId(1, "UnobservedTask"), "Unobserved task exception");
TaskScheduler.UnobservedTaskException += (aSender, aArgs) => vLogUnobserved(vUnobservedLogger, aArgs.Exception);

if (app.Environment.IsDevelopment())
{
    // Verification hook: an unobserved task exception is only raised when its task is finalized,
    // so the teardown specs force that here rather than waiting for a GC that may never come.
    app.MapPost("/verify/gc", () =>
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        return Results.Ok();
    });
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(TrBlazeUI.Demo.Routes).Assembly);

app.Run();
