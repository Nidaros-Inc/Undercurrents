
import React from 'react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index }) => {

    return (
  <div className="relative group">
    {/* Glow layer */}
    <div
      className="
        absolute inset-0
        rounded-3xl
        bg-purple-700/10
        blur-xl
        opacity-0
        transition-opacity duration-500
        group-hover:opacity-25
      "
    />

    {/* Card */}
    <div 
      className="relative z-10 bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:bg-slate-800/60 transition-all hover:scale-[1.02]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {recommendation.name}
          </h3>
          <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-full mt-1 border border-indigo-500/20 uppercase tracking-wider">
            {recommendation.genre}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest">Obscurity</div>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-3 rounded-full ${
                  i < recommendation.obscurityLevel ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-slate-300 leading-relaxed mb-4 italic">
        "{recommendation.description}"
      </p>
      
      <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/30">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <i className="fa-solid fa-sparkles text-indigo-400"></i> Why you'll love them
        </h4>
        <p className="text-sm text-slate-400">
          {recommendation.whyYouWillLikeIt}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <a 
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white/5 hover:bg-white/10 text-white text-center py-2 rounded-xl text-sm font-medium transition-colors border border-white/10"
        >
          <i className="fa-brands fa-youtube mr-2"></i> Listen
        </a>
      </div>
        </div>
  </div>
);
  );
};

export default RecommendationCard;
