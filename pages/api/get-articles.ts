import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { MongoClient } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client: MongoClient = await dbConnect;
    const db = client.db(); // or client.db("localnews")

    const { userId, title, url, source, location, savedAt } = req.body;

    const result = await db.collection('savedArticles').insertOne({
      userId,
      title,
      url,
      source,
      location,
      savedAt: new Date(savedAt),
    });

    return res.status(201).json({ message: 'Article saved', id: result.insertedId });
  } catch (error) {
    console.error('Save article error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
