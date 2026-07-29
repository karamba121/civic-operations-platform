using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestCommentRepository(RequestsDbContext dbContext)
    : IRequestCommentRepository
{
    public void Add(RequestComment comment)
    {
        dbContext.RequestComments.Add(comment);
    }
}
