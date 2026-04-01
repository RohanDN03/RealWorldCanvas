// Use environment variables for production, fallback to localhost for development
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
