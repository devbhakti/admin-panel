const isBrowser = typeof window !== 'undefined';

let rawUrl = process.env.NEXT_PUBLIC_API_URL || (isBrowser ? `${window.location.origin}/api` : "http://127.0.0.1:5000/api");

// Fix for VPS/Live server Firewall Timeout (ETIMEDOUT) or IPv6 (ECONNREFUSED) on SSR:
// Automatically route internal server requests to 127.0.0.1 (IPv4) on the same port.
if (!isBrowser && process.env.NEXT_PUBLIC_API_URL) {
    try {
        const urlObj = new URL(process.env.NEXT_PUBLIC_API_URL);
        if (urlObj.hostname !== '127.0.0.1' && urlObj.hostname !== 'localhost') {
            // Keep the same port (e.g. 5000) but point it to local IPv4 loopback
            urlObj.hostname = '127.0.0.1';
            // Force protocol to http internally
            urlObj.protocol = 'http:';
            rawUrl = urlObj.toString();
        } else if (urlObj.hostname === 'localhost') {
            // Convert localhost to 127.0.0.1 to avoid Node 18+ IPv6 ECONNREFUSED
            urlObj.hostname = '127.0.0.1';
            rawUrl = urlObj.toString();
        }
    } catch (e) {
        // Fallback if URL parsing fails
        rawUrl = "http://127.0.0.1:5000/api";
    }
}

export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
export const BASE_URL = API_URL.replace('/api', '');