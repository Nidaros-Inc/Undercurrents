import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';
import ArtistInput from './components/ArtistInput';
import RecommendationCard from './components/RecommendationCard';
import { getRecommendations } from './services/geminiService';
import type { Artist, Recommendation } from './types';
import ShareCard from './components/ShareCard';


function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [obscurityScore, setObscurityScore] = useState<number>(0);
  const [obscurityLabel, setObscurityLabel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [unlockProduct, setUnlockProduct] = useState<any>(null);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [hasShared, setHasShared] = useState<boolean>(false);
  const MAX_ARTISTS = 8;

  // -------------------------
  // Initialize Google Play Billing
  // -------------------------
  useEffect(() => {
    // Load persisted state
    if (localStorage.getItem("isPremium") === "true") {
      setIsPremium(true);
    }
    const savedCount = parseInt(localStorage.getItem("searchCount") || "0");
    setSearchCount(savedCount);
    if (localStorage.getItem("hasShared") === "true") {
      setHasShared(true);
    }

    if (Capacitor.getPlatform() === "web") return;

    const tryInitStore = () => {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        setTimeout(tryInitStore, 500);
        return;
      }

      const store = CdvPurchase.store;

      // Register subscription product
      store.register({
        id: "annual_unlock",
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
      });

      // Keep old product registered for existing purchasers
      store.register({
        id: "full_unlock",
        type: CdvPurchase.ProductType.NON_CONSUMABLE,
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
      });

      store.when()
        .productUpdated(() => {
          // Check subscription
          const subProduct = store.get("annual_unlock", CdvPurchase.Platform.GOOGLE_PLAY);
          if (subProduct) {
            setUnlockProduct(subProduct);
          }
          if (subProduct?.owned) {
            localStorage.setItem("isPremium", "true");
            setIsPremium(true);
          }
          // Check legacy one-off purchase
          const legacyProduct = store.get("full_unlock", CdvPurchase.Platform.GOOGLE_PLAY);
          if (legacyProduct?.owned) {
            localStorage.setItem("isPremium", "true");
            setIsPremium(true);
          }
        })
        .approved((transaction: any) => {
          transaction.verify();
        })
        .verified((receipt: any) => {
          localStorage.setItem("isPremium", "true");
          setIsPremium(true);
          receipt.finish();
        });

      store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
    };

    tryInitStore();
  }, []);

  // -------------------------
  // Artist management
  // -------------------------
  const handleAddArtist = (name: string) => {
    const newArtist: Artist = {
      id: crypto.randomUUID(),
      name,
    };
    setArtists([...artists, newArtist]);
    setError(null);
  };

  const handleRemoveArtist = (id: string) => {
    setArtists(artists.filter(artist => artist.id !== id));
  };

  // -------------------------
  // Handle purchase
  // -------------------------
  const handlePurchase = () => {
    if (Capacitor.getPlatform() !== "web") {
      if (unlockProduct && unlockProduct.offers && unlockProduct.offers.length > 0) {
        unlockProduct.offers[0].order();
      } else {
        alert("Subscription not available yet. Please try again in a moment.");
      }
    } else {
      alert("Subscription is only available in the installed Android app.");
    }
  };

  // -------------------------
  // Handle share unlock
  // -------------------------
  const handleShareUnlock = () => {
    localStorage.setItem("hasShared", "true");
    setHasShared(true);
  };

  // -------------------------
  // Recommendation & free-use logic
  // -------------------------
  const handleGetRecommendations = async () => {
    // Free use logic:
    // searchCount 0 = never searched (allow)
    // searchCount 1 = used first free search (allow only if hasShared)
    // searchCount 2+ = used both free searches (must be premium)
    const allowedSearches = hasShared ? 2 : 1;

    if (!isPremium && searchCount >= allowedSearches) {
      handlePurchase();
      return;
    }

    if (artists.length === 0) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await getRecommendations(artists);

      if (!response || !Array.isArray(response.recommendations)) {
        setError("API returned unexpected data.");
        return;
      }

      setRecommendations(response.recommendations);
      setObscurityScore(response.obscurityScore);
      setObscurityLabel(response.obscurityLabel);
      setHasSearched(true);

      if (!isPremium) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem("searchCount", newCount.toString());
      }

    } catch (err) {
      setError("Failed to get recommendations.");
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

  // Work out which DNA card message to show
  // First card: hasn't shared yet → show unlock messaging
  // Second card onwards: already shared → show friendly share message
  const isFirstShareOpportunity = !hasShared && searchCount <= 1;

  // -------------------------
  // Render UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1830] via-[#0a1830] to-[#18135a] -slate-300 px-4 sm:px-8 pb-8 pt-12">
      {/* Top logo badge */}
      <div className="flex justify-center mb-10 mt-8">
        <div
          style={{ animation: "glowPulse 7s ease-in-out infinite" }}
          className="px-5 py-2 rounded-full border border-purple-400/60 text-purple-300 text-sm tracking-wide shadow-[0_0_18px_rgba(168,85,247,0.35)] bg-purple-900/10"
        >
          Music Discovery From Nidaros
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10 px-4">
          <h1 className="text-5xl sm:text-6xl md:text-6xl font-extrabold tracking-tight mb-4 text-white">
            Undercurrents
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
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
              className="bg-sky-800/10 border border-sky-300/70 text-sky-100 px-8 py-4 rounded-2xl text-lg font-semibold tracking-wide transition-all duration-200 shadow-[0_0_26px_rgba(125,211,252,0.55)] hover:shadow-[0_0_36px_rgba(125,211,252,0.75)] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner-offset">
                    <span className="ai-spinner" />
                  </span>
                  Analyzing soundscapes...
                </span>
              ) : (
                "Get Recommendations"
              )}
            </button>

            {hasSearched && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleNewSearch}
                  className="group flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1c1c28] border border-slate-600 text-slate-500 text-[11px] hover:bg-slate-700/25 transition-all duration-200"
                >
                  <span className="text-[13px] transition-transform duration-300 group-hover:-rotate-180">
                    ↺
                  </span>
                  New Search
                </button>
              </div>
            )}

            {loading && (
              <p className="mt-4 text-slate-300">
                Generating recommendations, please wait...
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="flex justify-center mt-10">
            <div
              style={{ animation: "glowPulseOrange 6s ease-in-out infinite" }}
              className="px-6 py-3 rounded-full border border-orange-300/60 text-orange-200 text-sm md:text-base tracking-wide shadow-[0_0_20px_rgba(251,146,60,0.35)] bg-orange-900/10 text-center"
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

        {recommendations.length > 0 && (
          <ShareCard
            artists={artists}
            recommendations={recommendations}
            obscurityScore={obscurityScore}
            obscurityLabel={obscurityLabel}
            isFirstShareOpportunity={isFirstShareOpportunity}
            onShareComplete={handleShareUnlock}
          />
        )}
      </div>
    </div>
  );
}

export default App;