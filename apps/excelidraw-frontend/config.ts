// Use environment variables for production, fallback to localhost for development
const apiUrl =
	process.env.NEXT_PUBLIC_API_URL ||
	process.env.NEXT_PUBLIC_HTTPS_BACKEND_URL ||
	'http://localhost:10000';

const wsUrl =
	process.env.NEXT_PUBLIC_WS_URL ||
	process.env.NEXT_PUBLIC_WS_BACKEND_URL ||
	'ws://localhost:8080';

export const API_URL = apiUrl;
export const WS_URL = wsUrl;
