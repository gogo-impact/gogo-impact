import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, Db } from 'mongodb';
import * as bcrypt from 'bcrypt';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not configured');
  
  cachedClient = new MongoClient(uri);
  await cachedClient.connect();
  cachedDb = cachedClient.db(process.env.MONGO_DB_NAME || 'gogo-impact-report');
  return cachedDb;
}

// Collection name mapping (API path -> MongoDB collection name)
const collectionMap: Record<string, string> = {
  'hero': 'hero',
  'mission': 'mission',
  'defaults': 'defaults',
  'population': 'population',
  'financial': 'financial',
  'method': 'method',
  'curriculum': 'curriculum',
  'impact-section': 'impact_section',
  'hear-our-impact': 'hear_our_impact',
  'testimonials': 'testimonials',
  'national-impact': 'national_impact',
  'flex-a': 'flex_a',
  'flex-b': 'flex_b',
  'flex-c': 'flex_c',
  'impact-levels': 'impact_levels',
  'partners': 'partners',
  'footer': 'footer',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path from query parameter (set by Vercel rewrite) or URL
  const queryPath = req.query.path as string | undefined;
  const urlPath = req.url?.split('?')[0]?.replace(/^\/api/, '') || '/';
  const path = queryPath ? `/${queryPath}` : urlPath;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = await getDb();
    const slug = (req.query.slug as string) || 'impact-report';

    // Health check
    if (path === '/health' || path === '/') {
      return res.json({ status: 'ok', env: process.env.NODE_ENV });
    }

    // Auth routes
    if (path === '/auth/login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }
      
      const user = await db.collection('users').findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Return user info (in production, you'd set a session cookie)
      return res.json({ 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin || false 
      });
    }

    if (path === '/auth/me') {
      // For now, return null (not authenticated) - sessions are complex in serverless
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (path === '/auth/logout' && req.method === 'POST') {
      return res.json({ success: true });
    }

    // Impact content routes
    const impactMatch = path.match(/^\/impact\/(.+)$/);
    if (impactMatch) {
      const section = impactMatch[1];
      const collectionName = collectionMap[section];
      
      if (!collectionName) {
        return res.status(404).json({ error: 'Unknown section', section });
      }

      if (req.method === 'GET') {
        const doc = await db.collection(collectionName).findOne({ slug });
        if (!doc) {
          return res.status(404).json({ error: 'Content not found' });
        }
        const { _id, slug: storedSlug, ...data } = doc;
        return res.json({ data });
      }

      if (req.method === 'PUT') {
        const body = req.body || {};
        await db.collection(collectionName).updateOne(
          { slug },
          { $set: { ...body, slug, updatedAt: new Date() } },
          { upsert: true }
        );
        const doc = await db.collection(collectionName).findOne({ slug });
        const { _id, slug: storedSlug, ...data } = doc || {};
        return res.json({ data });
      }
    }

    // Upload routes
    if (path.startsWith('/upload')) {
      return res.status(501).json({ error: 'Upload not implemented in serverless mode' });
    }

    // Media routes  
    if (path.startsWith('/media')) {
      return res.status(501).json({ error: 'Media management not implemented in serverless mode' });
    }

    // Snapshot routes
    if (path.startsWith('/snapshots')) {
      return res.status(501).json({ error: 'Snapshots not implemented in serverless mode' });
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
