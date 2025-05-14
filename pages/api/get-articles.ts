// pages/api/get-articles.ts
import { NextApiRequest, NextApiResponse } from 'next';
import  dbConnect  from '@/lib/dbConnect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId as string;
    const db = await dbConnect();
    
    const articles = await db.collection('savedArticles')
      .find({ userId })
      .sort({ savedAt: -1 })
      .toArray();

    return res.status(200).json(articles);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}