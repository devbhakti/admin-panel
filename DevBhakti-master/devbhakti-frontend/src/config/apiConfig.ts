const isBrowser = typeof window !== 'undefined';

let rawUrl = process.env.NEXT_PUBLIC_API_URL || (isBrowser ? `${window.location.origin}/api` : "http://localhost:5000/api");

// Fix for VPS/Live server Firewall Timeout (ETIMEDOUT) on SSR:
// Automatically route internal server requests to localhost on the same port.
if (!isBrowser && process.env.NEXT_PUBLIC_API_URL) {
    try {
        const urlObj = new URL(process.env.NEXT_PUBLIC_API_URL);
        if (urlObj.hostname !== 'localhost' && urlObj.protocol === 'http:') {
            urlObj.hostname = 'localhost';
            rawUrl = urlObj.toString();
        }
    } catch (e) {
        // Fallback if URL parsing fails
    }
}

export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const BASE_URL = API_URL.replace('/api', '');