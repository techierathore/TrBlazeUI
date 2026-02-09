using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using TrBlazeUI.Demo.Extensions;
using TrBlazeUI.Demo.Wasm;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// Add all demo services via shared extension method
builder.Services.AddTrBlazeUIDemo();

await builder.Build().RunAsync();
