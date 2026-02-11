using Microsoft.Extensions.DependencyInjection;
using TrBlazeUI.Demo.Services;
using TrBlazeUI.Primitives.Extensions;
using TrBlazeUI.Components.Toast;

namespace TrBlazeUI.Demo.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTrBlazeUIDemo(this IServiceCollection services)
    {
        // Add TrBlazeUI.Primitives services
        services.AddTrBlazeUIPrimitives();

        // Add theme service for dark mode management
        services.AddScoped<ThemeService>();

        // Add collapsible state service for menu state persistence
        services.AddScoped<CollapsibleStateService>();

        // Add layout service for vertical/horizontal layout toggle
        services.AddScoped<LayoutService>();

        // Add mock data service for generating demo data
        services.AddSingleton<MockDataService>();

        // Add toast notification service
        services.AddScoped<ToastService>();

        return services;
    }
}
