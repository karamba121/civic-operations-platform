using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;
using System.Runtime.ExceptionServices;

namespace CivicOps.Modules.Requests.Application.UploadRequestAttachment;

public sealed class UploadRequestAttachmentHandler(
    IRequestRepository requestRepository,
    IRequestAttachmentRepository attachmentRepository,
    IAttachmentContentStore contentStore,
    RequestAttachmentAuthorization authorization,
    IRequestsUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public async Task<UploadRequestAttachmentResult?> HandleAsync(
        UploadRequestAttachmentCommand command,
        CancellationToken cancellationToken)
    {
        var request = await requestRepository.GetAsync(
            command.TenantId,
            command.RequestId,
            cancellationToken);

        if (request is null)
        {
            return null;
        }

        await authorization.EnsureCanWriteAsync(
            request,
            command.UploadedByUserId,
            cancellationToken);

        var fileName = NormalizeFileName(command.FileName);
        var attachmentType = AttachmentFilePolicy.ValidateDeclaredType(
            fileName,
            command.ContentType ?? string.Empty);
        var contentType = attachmentType.ContentType;
        var attachmentId = Guid.CreateVersion7();
        var storageKey =
            $"{command.TenantId:N}/{command.RequestId:N}/{attachmentId:N}";
        var storedContent = await contentStore.SaveAsync(
            storageKey,
            attachmentType,
            command.Content,
            cancellationToken);

        try
        {
            var createdAtUtc = timeProvider.GetUtcNow();
            var attachment = RequestAttachment.Create(
                attachmentId,
                command.TenantId,
                command.RequestId,
                command.UploadedByUserId,
                fileName,
                contentType,
                storedContent.SizeBytes,
                storageKey,
                storedContent.Sha256,
                createdAtUtc);

            return await unitOfWork.ExecuteInTransactionAsync(
                transactionCancellationToken =>
                {
                    attachmentRepository.Add(attachment);
                    request.RegisterAttachment(
                        attachment,
                        command.UploadedByUserId,
                        createdAtUtc);

                    return Task.FromResult(
                        new UploadRequestAttachmentResult(
                            attachment.Id,
                            attachment.RequestId,
                            attachment.UploadedByUserId,
                            attachment.FileName,
                            attachment.ContentType,
                            attachment.SizeBytes,
                            attachment.Sha256,
                            attachment.CreatedAtUtc));
                },
                cancellationToken);
        }
        catch (Exception persistenceException)
        {
            try
            {
                await contentStore.DeleteIfExistsAsync(
                    storageKey,
                    CancellationToken.None);
            }
            catch (Exception cleanupException)
            {
                throw new AggregateException(
                    "Falha ao persistir os metadados e remover o conteúdo órfão.",
                    persistenceException,
                    cleanupException);
            }

            ExceptionDispatchInfo
                .Capture(persistenceException)
                .Throw();
            throw;
        }
    }

    private static string NormalizeFileName(string fileName)
    {
        if (fileName is null)
        {
            return string.Empty;
        }

        var normalized = fileName
            .Replace('\\', '/')
            .Split(
                '/',
                StringSplitOptions.RemoveEmptyEntries)
            .LastOrDefault();

        return normalized?.Trim() ?? string.Empty;
    }
}
