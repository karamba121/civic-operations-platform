using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application;

public static class RequestAttachmentAuthorization
{
    public static void EnsureCanAccess(Request request, Guid userId)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!request.CanAccessAttachments(userId))
        {
            throw new AttachmentAccessDeniedException();
        }
    }
}
