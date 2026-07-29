using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestCommentRepository
{
    void Add(RequestComment comment);
}
