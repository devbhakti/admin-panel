const isBrowser = typeof window !== 'undefined';
// On the browser (e.g., mobile phone), use the public IP/Domain so it can connect remotely.
// On the server (Next.js SSR), always use localhost to prevent firewall timeout (ETIMEDOUT) errors.
const host = isBrowser ? window.location.origin : "http://localhost:5000";

const rawUrl = isBrowser 
    ? (process.env.NEXT_PUBLIC_API_URL || `${host}/api`) 
    : "http://localhost:5000/api";

export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const BASE_URL = API_URL.replace('/api', '');