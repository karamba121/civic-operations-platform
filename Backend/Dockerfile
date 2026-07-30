FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

COPY . .
RUN dotnet restore CivicOperationsPlatform.sln
RUN dotnet publish src/CivicOps.Api/CivicOps.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN mkdir -p /data/attachments \
    && chown -R $APP_UID /data/attachments
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "CivicOps.Api.dll"]
