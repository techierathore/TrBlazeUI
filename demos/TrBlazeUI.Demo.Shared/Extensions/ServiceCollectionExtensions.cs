using Microsoft.Extensions.DependencyInjection;
using TrBlazeUI.Demo.Services;
using TrBlazeUI.Primitives.Extensions;
using TrBlazeUI.Components.Toast;

namespace TrBlazeUI.Demo.Extensions;

/// <summary>
/// Extension methods for registering the TrBlazeUI demo services with the dependency injection container.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the TrBlazeUI primitives and demo services (theme, layout, collapsible state,
    /// mock data, and toast notifications) with the service collection.
    /// </summary>
    /// <param name="services">The service collection to add the services to.</param>
    /// <returns>The same service collection so that calls can be chained.</returns>
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
