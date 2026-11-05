using TrBlazeUI.Demo.Extensions;
using TrBlazeUI.Demo.Auto;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

// Add all demo services via shared extension method
builder.Services.AddTrBlazeUIDemo();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseAntiforgery();

// MapStaticAssets, not UseStaticFiles (REQ-FN-013). With the WebAssembly render mode and no static-asset
// resource collection, WebAssembly.Server maps a catch-all "_framework/{*path}" endpoint whose branch
// deliberately skips blazor.web.js, so the matched endpoint made UseStaticFiles step aside and the
// request ended 404 at the branch's end. The manifest-backed endpoints serve every _framework file.
app.MapStaticAssets();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(
        typeof(TrBlazeUI.Demo.Routes).Assembly,
        typeof(TrBlazeUI.Demo.Auto.Client._Imports).Assembly);

app.Run();
