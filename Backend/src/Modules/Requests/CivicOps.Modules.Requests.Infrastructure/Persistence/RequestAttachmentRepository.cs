using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestAttachmentRepository(
    RequestsDbContext dbContext) : IRequestAttachmentRepository
{
    public void Add(RequestAttachment attachment)
    {
        dbContext.RequestAttachments.Add(attachment);
    }
}
