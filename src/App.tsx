import { useState } from 'react';
import ArtistInput from './components/ArtistInput';
import RecommendationCard from './components/RecommendationCard';
import { getRecommendations } from './services/geminiService';
import type { Artist, Recommendation } from './types';


function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_ARTISTS = 5;

  const handleAddArtist = (name: string) => {
    const newArtist: Artist = {
      id: crypto.randomUUID(),
      name,
    };
    setArtists([...artists, newArtist]);
  };

  const handleRemoveArtist = (id: string) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  const handleGetRecommendations = async () => {
  if (artists.length === 0) return;

  setLoading(true);
  setError(null);
  setRecommendations([]); // Clear previous recommendations immediately

  try {
    const response = await getRecommendations(artists);
    setRecommendations(response.recommendations);
  } catch (err) {
    setError('Failed to get recommendations. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Undercurrents
          </h1>
          <p className="text-xl text-slate-300">
            Discover hidden indie music gems tailored to your taste
          </p>
        </header>

        <ArtistInput
          artists={artists}
          onAdd={handleAddArtist}
          onRemove={handleRemoveArtist}
          maxArtists={MAX_ARTISTS}
        />
        
        {artists.length > 0 && (
          <div className="mt-8 text-center">
           <button
  onClick={handleGetRecommendations}
  disabled={loading || artists.length === 0}
  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-colors"
>
  {loading ? 'Analyzing soundscapes...' : 'Get Recommendations'}
</button>

{loading && (
  <p className="mt-4 text-slate-300">AI is generating recommendations, please wait...</p>
)}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/50 border border-red-700 rounded-2xl text-center">
            {error}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              Your Personalized Recommendations
            </h2>
            {recommendations.map((rec, index) => (
              <RecommendationCard
                key={index}
                recommendation={rec}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
