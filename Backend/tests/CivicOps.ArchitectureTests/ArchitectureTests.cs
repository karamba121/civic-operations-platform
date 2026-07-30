using System.Reflection;
using System.Runtime.CompilerServices;

namespace CivicOps.ArchitectureTests;

public sealed class ArchitectureTests
{
    private const string Api = "CivicOps.Api";
    private const string BuildingBlocksDomain = "CivicOps.BuildingBlocks.Domain";
    private const string IdentityAccessCore =
        "CivicOps.Modules.IdentityAccess.Core";

    private static readonly string[] ProductionAssemblyNames =
    [
        BuildingBlocksDomain,
        "CivicOps.BuildingBlocks.Observability",
        Api,
        IdentityAccessCore,
        "CivicOps.Modules.IdentityAccess.Infrastructure",
        "CivicOps.Modules.Notifications.Application",
        "CivicOps.Modules.Notifications.Domain",
        "CivicOps.Modules.Notifications.Infrastructure",
        "CivicOps.Modules.Notifications.Presentation",
        "CivicOps.Modules.Requests.Application",
        "CivicOps.Modules.Requests.Domain",
        "CivicOps.Modules.Requests.Infrastructure",
        "CivicOps.Modules.Requests.Presentation"
    ];

    private static readonly Assembly[] ProductionAssemblies =
        ProductionAssemblyNames.Select(Assembly.Load).ToArray();

    [Fact]
    public void DomainAndCore_ShouldNotDependOnOuterLayers()
    {
        var innerAssemblies = ProductionAssemblies.Where(
            assembly =>
                AssemblyNameOf(assembly).EndsWith(".Domain")
                || AssemblyNameOf(assembly).EndsWith(".Core"));

        AssertNoReferences(
            innerAssemblies,
            IsOuterLayer,
            "Domain e Core não podem depender de Application, Infrastructure, "
            + "Presentation ou API.");
    }

    [Fact]
    public void Application_ShouldNotDependOnInfrastructurePresentationOrApi()
    {
        var applicationAssemblies = ProductionAssemblies.Where(
            assembly => AssemblyNameOf(assembly).EndsWith(".Application"));

        AssertNoReferences(
            applicationAssemblies,
            reference =>
                reference.EndsWith(".Infrastructure")
                || reference.EndsWith(".Presentation")
                || reference == Api,
            "Application não pode depender de Infrastructure, Presentation "
            + "ou API.");
    }

    [Fact]
    public void Modules_ShouldNotReferenceAnotherModulesOuterLayers()
    {
        var moduleAssemblies = ProductionAssemblies.Where(
            assembly => AssemblyNameOf(assembly).StartsWith("CivicOps.Modules."));

        foreach (var assembly in moduleAssemblies)
        {
            var assemblyName = AssemblyNameOf(assembly);
            var owningModule = ModuleNameOf(assemblyName);
            var violations = ReferencedCivicOpsAssemblies(assembly)
                .Where(reference =>
                    reference.StartsWith("CivicOps.Modules.")
                    && ModuleNameOf(reference) != owningModule
                    && (
                        reference.EndsWith(".Infrastructure")
                        || reference.EndsWith(".Presentation")))
                .Order()
                .ToArray();

            Assert.True(
                violations.Length == 0,
                $"{assemblyName} referencia camadas externas de outro módulo: "
                + string.Join(", ", violations));
        }
    }

    [Fact]
    public void Modules_ShouldNeverDependOnApi()
    {
        var moduleAssemblies = ProductionAssemblies.Where(
            assembly => AssemblyNameOf(assembly).StartsWith("CivicOps.Modules."));

        AssertNoReferences(
            moduleAssemblies,
            reference => reference == Api,
            "Módulos não podem depender do composition root.");
    }

    [Fact]
    public void Api_ShouldBeTheOnlyCrossModuleCompositionRoot()
    {
        var apiReferences = ReferencedCivicOpsAssemblies(AssemblyByName(Api));
        var expectedModuleEdges = new[]
        {
            "CivicOps.Modules.IdentityAccess.Infrastructure",
            "CivicOps.Modules.Notifications.Infrastructure",
            "CivicOps.Modules.Notifications.Presentation",
            "CivicOps.Modules.Requests.Infrastructure",
            "CivicOps.Modules.Requests.Presentation"
        };

        var missingEdges = expectedModuleEdges
            .Except(apiReferences)
            .Order()
            .ToArray();

        Assert.True(
            missingEdges.Length == 0,
            "A API deixou de compor estas superfícies dos módulos: "
            + string.Join(", ", missingEdges));

        var nonApiInfrastructureConsumers = ProductionAssemblies
            .Where(assembly => AssemblyNameOf(assembly) != Api)
            .SelectMany(assembly =>
                ReferencedCivicOpsAssemblies(assembly)
                    .Where(reference => reference.EndsWith(".Infrastructure"))
                    .Select(reference =>
                        $"{AssemblyNameOf(assembly)} -> {reference}"))
            .ToArray();

        Assert.True(
            nonApiInfrastructureConsumers.Length == 0,
            "Somente a API pode compor Infrastructure: "
            + string.Join(", ", nonApiInfrastructureConsumers));
    }

    [Fact]
    public void EntityFrameworkCore_ShouldRemainInsideInfrastructure()
    {
        var violations = ProductionAssemblies
            .Where(assembly =>
                !AssemblyNameOf(assembly).EndsWith(".Infrastructure"))
            .Where(assembly =>
                assembly.GetReferencedAssemblies().Any(
                    reference =>
                        reference.Name?.StartsWith(
                            "Microsoft.EntityFrameworkCore",
                            StringComparison.Ordinal) == true))
            .Select(AssemblyNameOf)
            .Order()
            .ToArray();

        Assert.True(
            violations.Length == 0,
            "EF Core foi referenciado fora de Infrastructure: "
            + string.Join(", ", violations));
    }

    [Fact]
    public void DbContexts_ShouldBelongToTheirOwningInfrastructure()
    {
        var dbContexts = ProductionAssemblies
            .SelectMany(GetLoadableTypes)
            .Where(IsDbContext)
            .ToArray();

        var unexpectedContexts = dbContexts
            .Where(type =>
            {
                var assemblyName = AssemblyNameOf(type.Assembly);
                var expectedNamespacePrefix =
                    assemblyName + ".Persistence";

                return !assemblyName.EndsWith(".Infrastructure")
                    || type.Namespace?.StartsWith(
                        expectedNamespacePrefix,
                        StringComparison.Ordinal) != true;
            })
            .Select(type => type.FullName ?? type.Name)
            .Order()
            .ToArray();

        Assert.True(
            unexpectedContexts.Length == 0,
            "DbContexts fora da infraestrutura proprietária: "
            + string.Join(", ", unexpectedContexts));

        var expectedContexts = new[]
        {
            "CivicOps.Modules.IdentityAccess.Infrastructure.Persistence"
                + ".IdentityAccessDbContext",
            "CivicOps.Modules.Notifications.Infrastructure.Persistence"
                + ".NotificationsDbContext",
            "CivicOps.Modules.Requests.Infrastructure.Persistence"
                + ".RequestsDbContext"
        };

        var actualContexts = dbContexts
            .Select(type => type.FullName)
            .OfType<string>()
            .Order()
            .ToArray();

        Assert.Equal(expectedContexts.Order(), actualContexts);
    }

    [Fact]
    public void ProductionModules_ShouldNotExposeInternalsToOtherModules()
    {
        var violations = ProductionAssemblies
            .Where(assembly =>
                AssemblyNameOf(assembly).StartsWith("CivicOps.Modules."))
            .SelectMany(assembly =>
                assembly.GetCustomAttributes<InternalsVisibleToAttribute>()
                    .Where(attribute =>
                        attribute.AssemblyName.StartsWith(
                            "CivicOps.Modules.",
                            StringComparison.Ordinal)
                        && !attribute.AssemblyName.EndsWith(
                            "Tests",
                            StringComparison.Ordinal))
                    .Select(attribute =>
                        $"{AssemblyNameOf(assembly)} -> "
                        + attribute.AssemblyName))
            .Order()
            .ToArray();

        Assert.True(
            violations.Length == 0,
            "Tipos internos foram expostos a outros módulos: "
            + string.Join(", ", violations));
    }

    private static void AssertNoReferences(
        IEnumerable<Assembly> assemblies,
        Func<string, bool> isForbidden,
        string rule)
    {
        var violations = assemblies
            .SelectMany(assembly =>
                ReferencedCivicOpsAssemblies(assembly)
                    .Where(isForbidden)
                    .Select(reference =>
                        $"{AssemblyNameOf(assembly)} -> {reference}"))
            .Order()
            .ToArray();

        Assert.True(
            violations.Length == 0,
            rule + " Violações: " + string.Join(", ", violations));
    }

    private static bool IsOuterLayer(string assemblyName) =>
        assemblyName.EndsWith(".Application")
        || assemblyName.EndsWith(".Infrastructure")
        || assemblyName.EndsWith(".Presentation")
        || assemblyName == Api;

    private static string[] ReferencedCivicOpsAssemblies(Assembly assembly) =>
        assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .OfType<string>()
            .Where(name => name.StartsWith("CivicOps.", StringComparison.Ordinal))
            .ToArray();

    private static Assembly AssemblyByName(string name) =>
        ProductionAssemblies.Single(
            assembly => AssemblyNameOf(assembly) == name);

    private static string AssemblyNameOf(Assembly assembly) =>
        assembly.GetName().Name
        ?? throw new InvalidOperationException("Assembly sem nome.");

    private static string ModuleNameOf(string assemblyName)
    {
        var parts = assemblyName.Split('.');
        return parts.Length >= 3
            ? parts[2]
            : throw new InvalidOperationException(
                $"Assembly fora do padrão de módulos: {assemblyName}");
    }

    private static Type[] GetLoadableTypes(Assembly assembly)
    {
        try
        {
            return assembly.GetTypes();
        }
        catch (ReflectionTypeLoadException exception)
        {
            return exception.Types.OfType<Type>().ToArray();
        }
    }

    private static bool IsDbContext(Type type)
    {
        for (var current = type.BaseType; current is not null; current = current.BaseType)
        {
            if (current.FullName == "Microsoft.EntityFrameworkCore.DbContext")
            {
                return true;
            }
        }

        return false;
    }
}
