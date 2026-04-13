import React, { useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Artist, Recommendation } from '../types';

interface ShareCardProps {
  artists: Artist[];
  recommendations: Recommendation[];
  obscurityScore: number;
  obscurityLabel: string;
  isFirstShareOpportunity: boolean;
  onShareComplete: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({
  artists,
  recommendations,
  obscurityScore,
  obscurityLabel,
  isFirstShareOpportunity,
  onShareComplete,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

 const handleShare = async () => {
    try {
      const { Share } = await import('@capacitor/share');
      if (Capacitor.getPlatform() !== 'web') {
        await Share.share({
          title: 'My Music DNA — Undercurrents',
          text: `My music taste is more eclectic than ${obscurityScore}% of listeners. Discover yours on Undercurrents.`,
          url: 'https://play.google.com/store/apps/details?id=com.nidaros.undercurrents',
          dialogTitle: 'Share your Music DNA',
        });
        onShareComplete();
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const topRecommendations = recommendations.slice(0, 3);
  const filledDots = Math.round((obscurityScore / 100) * 10);

  return (
    <div className="mt-16 flex flex-col items-center w-full px-4 pb-12">
      <h2 className="text-2xl font-semibold text-slate-200 mb-6 tracking-tight">
        Your Music DNA
      </h2>

      {/* Card */}
      <div
        ref={cardRef}
        className="w-full rounded-3xl border border-slate-700/60 bg-[#0d1b3e] p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Undercurrents
            </h3>
            <p className="text-slate-400 text-xs mt-1">Your music DNA</p>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest text-right leading-relaxed">
            Undercurrents App<br />Nidaros Inc
          </div>
        </div>

        {/* Your Taste */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            Your Taste
          </p>
          <div className="flex flex-wrap gap-1.5">
            {artists.map(artist => (
              <span
                key={artist.id}
                className="px-2.5 py-1 rounded-full border border-slate-600 text-slate-300 text-xs bg-slate-800/50 max-w-full truncate"
              >
                {artist.name}
              </span>
            ))}
          </div>
        </div>

        {/* Obscurity Score */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/40 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">
            Obscurity Score
          </p>
          {/* Dots row */}
          <div className="flex gap-1 mb-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  i < filledDots ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          {/* Score text stacked */}
          <div className="flex flex-wrap items-baseline gap-1">
            <span className="text-slate-400 text-xs">More eclectic than</span>
            <span className="text-white font-extrabold text-2xl">
              {obscurityScore}%
            </span>
            <span className="text-slate-400 text-xs">of listeners</span>
          </div>
          <p className="text-emerald-400 text-xs font-semibold mt-2 uppercase tracking-wider">
            {obscurityLabel}
          </p>
        </div>

        {/* You Might Love */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            You Might Love
          </p>
          <div className="flex flex-col gap-2">
            {topRecommendations.map(rec => (
              <div
                key={rec.name}
                className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-3 py-2.5 border-l-2 border-purple-500"
              >
                {rec.image && (
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{rec.name}</p>
                  <p className="text-slate-500 text-xs uppercase tracking-wider truncate">
                    {rec.genre}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-700/40 text-center">
          <p className="text-slate-600 text-[9px] uppercase tracking-widest">
            Undercurrents App · Nidaros Inc · Discover your sound
          </p>
        </div>
      </div>

      {/* Unlock message */}
      {isFirstShareOpportunity && (
        <p className="mt-4 text-center text-sm text-purple-300 px-4">
          Share your Music DNA to unlock one more free search 🎵
        </p>
      )}

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="mt-4 mb-8 w-full px-8 py-4 rounded-2xl bg-purple-700/30 border border-purple-400/60 text-purple-200 font-semibold text-lg tracking-wide shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:shadow-[0_0_36px_rgba(168,85,247,0.55)] transition-all duration-200"
      >
        {isFirstShareOpportunity ? 'Share to unlock one more search' : 'Enjoyed it? Share with friends'}
      </button>
    </div>
  );
};

export default ShareCard;