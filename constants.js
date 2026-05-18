// We use '/api' in local development to take advantage of the Vite proxy.
// In production, we call your AWS API Gateway directly.
// Since the correct paths (/prod/create and /prod/join) are valid endpoints,
// the API Gateway will successfully respond with CORS header 'Access-Control-Allow-Origin: *'.
export const DEMO_API_URL =
  import.meta.env.DEV
    ? '/api'
    : 'https://k0ljndvw90.execute-api.us-east-1.amazonaws.com/prod';

export const DEMO_API_KEY = 'M738diLr2xJapjWfioKn';
