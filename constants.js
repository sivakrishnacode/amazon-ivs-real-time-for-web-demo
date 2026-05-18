// We use the relative proxy path '/api' in both development and production.
// - In local development: Vite Proxy routes '/api' to your regional API Gateway.
// - In production: AWS Amplify Rewrite rule routes '/api' to your regional API Gateway.
// This completely bypasses all browser CORS restrictions in both environments!
export const DEMO_API_URL = '/api';

export const DEMO_API_KEY = 'M738diLr2xJapjWfioKn';
