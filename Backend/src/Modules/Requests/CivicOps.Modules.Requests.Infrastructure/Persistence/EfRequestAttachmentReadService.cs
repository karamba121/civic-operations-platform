using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.ListRequestAttachments;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class EfRequestAttachmentReadService(
    RequestsDbContext dbContext) : IRequestAttachmentReadService
{
    public async Task<IReadOnlyCollection<RequestAttachmentListItem>?> ListAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var requestExists = await dbContext.Requests
            .AsNoTracking()
            .AnyAsync(
                request =>
                    request.TenantId == tenantId &&
                    request.Id == requestId,
                cancellationToken);

        if (!requestExists)
        {
            return null;
        }

        return await dbContext.RequestAttachments
            .AsNoTracking()
            .Where(attachment =>
                attachment.TenantId == tenantId &&
                attachment.RequestId == requestId)
            .OrderByDescending(attachment => attachment.CreatedAtUtc)
            .ThenByDescending(attachment => attachment.Id)
            .Select(attachment => new RequestAttachmentListItem(
                attachment.Id,
                attachment.UploadedByUserId,
                attachment.FileName,
                attachment.ContentType,
                attachment.SizeBytes,
                attachment.Sha256,
                attachment.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }

    public Task<RequestAttachmentContentDescriptor?> GetAsync(
        Guid tenantId,
        Guid requestId,
        Guid attachmentId,
        CancellationToken cancellationToken)
    {
        return dbContext.RequestAttachments
            .AsNoTracking()
            .Where(attachment =>
                attachment.TenantId == tenantId &&
                attachment.RequestId == requestId &&
                attachment.Id == attachmentId)
            .Select(attachment =>
                new RequestAttachmentContentDescriptor(
                    attachment.Id,
                    attachment.FileName,
                    attachment.ContentType,
                    attachment.SizeBytes,
                    attachment.StorageKey))
            .SingleOrDefaultAsync(cancellationToken);
    }
}
