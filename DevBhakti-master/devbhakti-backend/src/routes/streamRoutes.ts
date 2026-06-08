import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Simple proxy to fetch remote HLS (.m3u8/.ts) and return with permissive CORS headers.
// Restrict allowed hosts to prevent open proxy abuse.
const ALLOWED_HOSTS = [
  'livebox.co.in',
  'account20.livebox.co.in',
  'account2.livebox.co.in',
  'account10.livebox.co.in',
  'account19.livebox.co.in',
];

const isAllowedHost = (host: string) => {
  if (!host) return false;
  return ALLOWED_HOSTS.some(h => host === h || host.endsWith(h));
};

router.get('/proxy', async (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url query param' });

  try {
    const parsed = new URL(url);
    if (!isAllowedHost(parsed.hostname)) {
      return res.status(403).json({ error: 'Host not allowed' });
    }

    const response = await axios.get(url, { responseType: 'stream', timeout: 20000 });

    // Forward selected headers
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    // Pipe the remote stream to client
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Stream proxy error:', error.message || error);
    res.status(502).json({ error: 'Failed to proxy stream', details: error.message });
  }
});

export default router;
