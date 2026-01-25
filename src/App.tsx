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
  const [hasSearched, setHasSearched] = useState(false);
  const MAX_ARTISTS = 8;

  const handleAddArtist = (name: string) => {
  const newArtist: Artist = {
    id: crypto.randomUUID(),
    name,
  };

  setArtists([...artists, newArtist]);
  setError(null); // 👈 hide error when user starts a new search
};

  const handleRemoveArtist = (id: string) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  const handleGetRecommendations = async () => {
  if (artists.length === 0) {
    console.log('No artists added yet.');
    return;
  }

  setLoading(true);
  setError(null);
  setRecommendations([]); // Clear previous recommendations immediately
  console.log('Artists being sent to API:', artists);

  try {
    const response = await getRecommendations(artists);
    console.log('Raw API response:', response);

    if (!response || !Array.isArray(response.recommendations)) {
      console.error('Unexpected response format:', response);
      setError('API returned unexpected data.');
      return;
    }

    console.log('Parsed recommendations:', response.recommendations);
    setRecommendations(response.recommendations);
    setHasSearched(true);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    setError('Failed to get recommendations. Please check the console for details.');
  } finally {
    setLoading(false);
  }
};
    const handleNewSearch = () => {
  setArtists([]);
  setRecommendations([]);
  setError(null);
  setHasSearched(false);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1830] via-[#0a1830]  to-[#18135a] -slate-300 p-8">
      {/* Top logo badge */}
<div className="flex justify-center mb-10">
  <div
  style={{ animation: 'glowPulse 7s ease-in-out infinite' }}
  className="
      px-5 py-2
    rounded-full
    border border-purple-400/60
    text-purple-300
    text-sm
    tracking-wide
    shadow-[0_0_18px_rgba(168,85,247,0.35)]
    bg-purple-900/10
"
>
  Music Discovery From Nidaros
</div>
</div>
      <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
 <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-white">
    Undercurrents
  </h1>
  <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
    Discover hidden music gems tailored to your taste
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
className="
  bg-purple-900/10
  border border-purple-400/60
  text-purple-300
  px-8 py-4
  rounded-2xl
  text-lg font-semibold
  tracking-wide
  shadow-[0_0_18px_rgba(168,85,247,0.35)]
  hover:shadow-[0_0_26px_rgba(168,85,247,0.5)]
  transition-all duration-200
  disabled:opacity-70
"
>
 {loading ? (
  <span className="flex items-center justify-center gap-2">
    <span className="ai-spinner" />
    Analyzing soundscapes...
  </span>
) : (
  'Get Recommendations'
)}
</button>
{hasSearched && (
  <div className="mt-4 flex justify-center">
    <button
      onClick={handleNewSearch}
     className="
  group
  flex items-center gap-1
  px-2.5 py-1
  rounded-md
  bg-[#1c1c28]
  border border-slate-600
  text-slate-500
  text-[11px]
  hover:bg-slate-700/25
  transition-all duration-200
"
    >
      <span
  className="
    text-[13px]
    transition-transform duration-300
    group-hover:-rotate-180
  "
>
  ↺
</span>
      New Search
    </button>
  </div>
)}
{loading && (
  <p className="mt-4 text-slate-300">AI is generating recommendations, please wait...</p>
)}
          </div>
        )}

        {error && (
  <div className="flex justify-center mt-10">
    <div
      style={{ animation: 'glowPulseOrange 6s ease-in-out infinite' }}
      className="
        px-6 py-3
        rounded-full
        border border-orange-300/60
        text-orange-200
        text-sm md:text-base
        tracking-wide
        shadow-[0_0_20px_rgba(251,146,60,0.35)]
        bg-orange-900/10
        text-center
      "
    >
      Failed to get recommendations — please try again
    </div>
  </div>
)}

        {recommendations.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight text-center mb-10 text-slate-200">
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
