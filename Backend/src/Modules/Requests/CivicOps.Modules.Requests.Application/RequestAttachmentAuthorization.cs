using CivicOps.Modules.IdentityAccess;
using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application;

public sealed class RequestAttachmentAuthorization(
    IPermissionAuthorizer permissionAuthorizer)
{
    public Task EnsureCanReadAsync(
        Request request,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return EnsureCanAccessAsync(
            request,
            userId,
            PermissionNames.AttachmentsRead,
            cancellationToken);
    }

    public Task EnsureCanWriteAsync(
        Request request,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return EnsureCanAccessAsync(
            request,
            userId,
            PermissionNames.AttachmentsWrite,
            cancellationToken);
    }

    private async Task EnsureCanAccessAsync(
        Request request,
        Guid userId,
        string permission,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (request.CanAccessAttachments(userId))
        {
            return;
        }

        if (!await permissionAuthorizer.HasPermissionAsync(
                request.TenantId,
                userId,
                permission,
                cancellationToken))
        {
            throw new AttachmentAccessDeniedException();
        }
    }
}
