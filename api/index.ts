import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not configured');
  
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  return cachedClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path from query parameter (set by Vercel rewrite) or URL
  const queryPath = req.query.path as string | undefined;
  const urlPath = req.url?.split('?')[0]?.replace(/^\/api/, '') || '/';
  const path = queryPath ? `/${queryPath}` : urlPath;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClient();
    const db = client.db(process.env.MONGO_DB_NAME || 'gogo-impact-report');

    // Health check
    if (path === '/health' || path === '/') {
      return res.json({ status: 'ok', env: process.env.NODE_ENV });
    }

    // GET routes for impact content
    if (req.method === 'GET') {
      const sectionMap: Record<string, string> = {
        '/impact/hero': 'hero',
        '/impact/mission': 'mission',
        '/impact/defaults': 'defaults',
        '/impact/population': 'population',
        '/impact/financial': 'financial',
        '/impact/method': 'method',
        '/impact/curriculum': 'curriculum',
        '/impact/impact-section': 'impactSection',
        '/impact/hear-our-impact': 'hearOurImpact',
        '/impact/testimonials': 'testimonials',
        '/impact/national-impact': 'nationalImpact',
        '/impact/flex-a': 'flexA',
        '/impact/flex-b': 'flexB',
        '/impact/flex-c': 'flexC',
        '/impact/impact-levels': 'impactLevels',
        '/impact/partners': 'partners',
        '/impact/footer': 'footer',
      };

      const collectionName = sectionMap[path];
      if (collectionName) {
        const doc = await db.collection(collectionName).findOne({});
        if (!doc) {
          return res.status(404).json({ error: 'Not found' });
        }
        const { _id, ...data } = doc;
        return res.json({ data });
      }
    }

    // PUT routes for impact content (requires auth in production)
    if (req.method === 'PUT') {
      const sectionMap: Record<string, string> = {
        '/impact/hero': 'hero',
        '/impact/mission': 'mission',
        '/impact/defaults': 'defaults',
        '/impact/population': 'population',
        '/impact/financial': 'financial',
        '/impact/method': 'method',
        '/impact/curriculum': 'curriculum',
        '/impact/impact-section': 'impactSection',
        '/impact/hear-our-impact': 'hearOurImpact',
        '/impact/testimonials': 'testimonials',
        '/impact/national-impact': 'nationalImpact',
        '/impact/flex-a': 'flexA',
        '/impact/flex-b': 'flexB',
        '/impact/flex-c': 'flexC',
        '/impact/impact-levels': 'impactLevels',
        '/impact/partners': 'partners',
        '/impact/footer': 'footer',
      };

      const collectionName = sectionMap[path];
      if (collectionName) {
        const body = req.body;
        await db.collection(collectionName).updateOne(
          {},
          { $set: body },
          { upsert: true }
        );
        const doc = await db.collection(collectionName).findOne({});
        const { _id, ...data } = doc || {};
        return res.json({ data });
      }
    }

    return res.status(404).json({ error: 'Not found', path });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
