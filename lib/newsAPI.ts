interface Article {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: { name: string };
  }
  
  export const fetchLocalNews = async (location: string): Promise<Article[]> => {
    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${location}&token=${process.env.NEXT_PUBLIC_GNEWS_KEY}&lang=en&max=10`
      );
      const { articles } = await response.json();
      return articles || [];
    } catch (error) {
      console.error("News fetch failed:", error);
      return [];
    }
  };