# Frontend

Painel administrativo Angular da Civic Operations Platform, usando TailAdmin
como base visual. A implementação funcional será feita em fatias verticais
versionadas no [roadmap](../docs/roadmap.md).

## Executar pela composição

Na raiz do repositório:

```powershell
docker compose up -d --build --wait
```

O frontend estará em `http://localhost:4200`. O Nginx serve a aplicação e
encaminha requisições iniciadas por `/api` para o serviço `api`, evitando
configuração CORS diferente entre desenvolvimento e a imagem local.

## Desenvolvimento

```powershell
npm ci
npm start
```

O servidor de desenvolvimento fica em `http://localhost:4200`. Até a camada
HTTP da aplicação ser implementada, o conteúdo continua sendo o template
TailAdmin e não representa uma integração concluída com a API.

## Base visual

### Angular TailAdmin Pro

TailAdmin is a premium Angular administrative dashboard template featuring a modern design, multiple layouts, and specialized dashboards for various business needs.

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory.

### Changelog

### v1.1.1 (2026-05-23)
- **New Feature**: Added **AI Settings** page to configure models, keys, and token limits.
- **New Feature**: Added **Maps** page with MapLibre GL, Leaflet, and iframe styles.
- **New Feature**: Added **Vector Maps** page powered by AmCharts 5 geodata (World & USA).
- **New Feature**: Added **Radar Charts** page with 3 unique formats.
- **New Feature**: Added **Radial Progress Charts** page featuring 4 custom layout templates.
- **Enhancement**: Introduced new **Bar Charts Five & Six** and **Pie Charts Four & Five**.
- **Bug Fix**: Resolved dropdown menu z-index stacking context overlapping issue in AI Chat history.
- **Enhancement**: Resolved spacing gaps under map card containers.

### v1.1.0 (2026-04-28)
- **New Feature**: Added **AI Dashboard** with token usage and revenue tracking.
- **New Feature**: Added **Sales Dashboard** with retention and multi-channel analytics.
- **New Feature**: Added **Finance Dashboard** with cashflow and balance management.
- **New Feature**: Introduced **6 New Layout variations** for improved UI flexibility.
- **Enhancement**: Integrated **Advanced Data Visualization** with 7+ new chart types.

### v1.0.3 (2026-03-15)
- **Upgrade**: update angular dependencies and remove commented code.

### v1.0.2 (2025-12-30)
- **Upgrade**: Successfully upgraded project to **Angular 21**.
- **New Feature**: Implementing **Dynamic API Keys** management.
- **Enhancement**: Integrated **Flatpickr** date range picker.
