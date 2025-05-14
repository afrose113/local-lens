import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/dbConnect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, articleId } = req.body;
    const client = await clientPromise;
    const db = client.db("localnews");
    
    const result = await db.collection('savedArticles').deleteOne({
      userId,
      _id: new ObjectId(articleId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}