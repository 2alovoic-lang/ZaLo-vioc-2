import type { IncomingMessage, ServerResponse } from 'http';
import { handleHealthCheck } from '../src/server/healthHandler.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return handleHealthCheck(req, res);
}
