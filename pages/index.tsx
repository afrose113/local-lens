import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import { fetchLocalNews } from '@/lib/newsAPI';
import { SaveButton } from '@/components/SaveButton';

interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt?: string;
}

interface SavedArticle extends Article {
  _id: string;
  savedAt: string;
}

export default function Home() {
  const [center, setCenter] = useState({ lat: 30.2672, lng: -97.7431 }); // Default: Austin, TX
  const [location, setLocation] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Auto-detect user's location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchNews(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError("Please enable location access or search manually");
          console.error("Geolocation error:", err);
        }
      );
    }
  }, []);

  // Fetch news for location
  const fetchNews = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError('');
    try {
      // First get the city name from coordinates
      const geocodeRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GMAPS_KEY}`
      );
      const geocodeData = await geocodeRes.json();
      
      const city = geocodeData.results?.[0]?.address_components?.find(
        (comp: any) => comp.types.includes('locality')
      )?.long_name || 'local';

      // Then fetch news for that location
      const news = await fetchLocalNews(city);
      setArticles(news);
    } catch (err) {
      setError("Failed to fetch news");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual location search
  const handleSearch = async () => {
    if (!location.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.NEXT_PUBLIC_GMAPS_KEY}`
      );
      const data = await response.json();
      
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setCenter({ lat, lng });
        await fetchNews(lat, lng);
        setShowSaved(false); // Switch back to latest news view
      } else {
        setError("Location not found");
      }
    } catch (err) {
      setError("Search failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saved articles from MongoDB
  const fetchSavedArticles = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('No user ID found. Save an article first.');
        return;
      }
      
      const response = await fetch(`/api/get-articles?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved articles');
      }
      const data = await response.json();
      setSavedArticles(data);
    } catch (error) {
      console.error('Failed to load saved articles:', error);
      alert('Failed to load saved articles');
    }
  };

  // Toggle between saved and latest news
  const toggleSavedView = () => {
    if (!showSaved) {
      fetchSavedArticles();
    }
    setShowSaved(!showSaved);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">LocalLens</h1>
        
        {/* Search Box */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter location or address"
            className="flex-1 border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleSearch}
            disabled={!location.trim() || isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            onClick={toggleSavedView}
          >
            {showSaved ? 'Show Latest News' : 'View Saved Articles'}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-6 text-center">{error}</p>}

        {/* Map and News Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Section */}
          <div className="w-full lg:w-2/3 h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GMAPS_KEY!}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={12}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={center} />
                <Circle
                  center={center}
                  radius={8046.72} // 5 miles in meters
                  options={{
                    fillColor: "#4285F4",
                    fillOpacity: 0.2,
                    strokeColor: "#4285F4",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </div>

          {/* News Section */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {showSaved ? 'Saved Articles' : `Nearby News (${articles.length})`}
            </h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : showSaved ? (
              <div className="grid gap-6">
                {savedArticles.length > 0 ? (
                  savedArticles.map((article, i) => (
                    <div 
                      key={`saved-${i}`} 
                      className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
                    >
                      <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{article.source.name}</p>
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                      <div className="flex justify-between items-center">
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Read more →
                        </a>
                        <span className="text-xs text-gray-400">
                          Saved on: {new Date(article.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p className="text-gray-500">No saved articles yet</p>
                  </div>
                )}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid gap-6">
                {articles.map((article, i) => (
                  <div 
                    key={i} 
                    className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{article.source.name}</p>
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                    <div className="flex justify-between items-center">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Read more →
                      </a>
                      <SaveButton article={article} onSave={fetchSavedArticles} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <p className="text-gray-500">
                  {showSaved ? "No saved articles yet" : "No news found in this area"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">Current Location</h3>
          <p className="text-gray-600">Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}