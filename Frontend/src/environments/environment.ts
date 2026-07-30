export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  auth: {
    url: 'http://localhost:4200/auth',
    realm: 'civicops',
    clientId: 'civicops-frontend',
  },
} as const;
