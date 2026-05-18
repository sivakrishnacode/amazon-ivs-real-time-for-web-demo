export const DEMO_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? '/api'
    : 'https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/prod/M738diLr2xJapjWfioKn');
