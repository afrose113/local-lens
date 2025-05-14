// pages/api/save-article.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '@/lib/dbConnect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, title, url, source, location } = req.body;
    
    if (!userId || !title || !url || !source) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = await dbConnect();
    
    const result = await db.collection('savedArticles').insertOne({
      userId,
      title,
      url,
      source,
      location,
      savedAt: new Date()
    });

    return res.status(201).json({ 
      success: true,
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to save article' 
    });
  }
}