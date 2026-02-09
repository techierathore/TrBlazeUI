using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using TrBlazeUI.Demo.Extensions;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// Add all demo services via shared extension method
builder.Services.AddTrBlazeUIDemo();

await builder.Build().RunAsync();
