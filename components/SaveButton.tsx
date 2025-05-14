import { useState } from 'react';

interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
}

export const SaveButton = ({ article }: { article: Article }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = localStorage.getItem('userId') || Math.random().toString(36);
      localStorage.setItem('userId', userId);

      const response = await fetch('/api/save-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: article.title,
          url: article.url,
          source: article.source.name,
          location: { lat: 0, lng: 0 }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      alert('Article saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors disabled:opacity-50"
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  );
};