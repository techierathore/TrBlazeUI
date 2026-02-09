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

app.UseStaticFiles();

app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(
        typeof(TrBlazeUI.Demo.Routes).Assembly,
        typeof(TrBlazeUI.Demo.Auto.Client._Imports).Assembly);

app.Run();
