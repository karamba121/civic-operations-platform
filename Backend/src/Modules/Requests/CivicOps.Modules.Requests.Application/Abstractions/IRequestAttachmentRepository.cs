using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestAttachmentRepository
{
    void Add(RequestAttachment attachment);
}
