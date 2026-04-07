import React from 'react';
import type { Recommendation } from '../types';

interface PlaylistCardProps {
  recommendations: Recommendation[];
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ recommendations }) => {
  const allTracks = recommendations.flatMap(rec =>
    (rec.tracks || []).map(track => ({
      name: track.name,
      spotifyUrl: track.spotifyUrl,
      albumArt: track.albumArt,
      albumName: track.albumName,
      artistName: rec.name,
    }))
  );

  if (allTracks.length === 0) return null;

  return (
    <div className="mt-12 w-full">
      <h2 className="text-3xl font-semibold tracking-tight text-center mb-8 text-slate-200">
        Your Undercurrents Playlist
      </h2>
      <div className="flex flex-col gap-3">
        {allTracks.map((track, index) => (
          <a key={index} href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 hover:bg-slate-800/70 transition-all duration-200 group">
            <div className="w-6 text-center text-slate-500 text-sm flex-shrink-0">{index + 1}</div>
            {track.albumArt ? (<img src={track.albumArt} alt={track.albumName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md" />) : (<div className="w-12 h-12 rounded-lg bg-slate-700 flex-shrink-0" />)}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate group-hover:text-green-400 transition-colors">{track.name}</p>
              <p className="text-slate-400 text-xs truncate">{track.artistName}</p>
              <p className="text-slate-600 text-xs truncate">{track.albumName}</p>
            </div>
            <div className="flex-shrink-0 text-slate-600 group-hover:text-green-400 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            </div>
          </a>
        ))}
      </div>
      <p className="text-center text-slate-600 text-xs mt-4">Tap any track to open in Spotify</p>
    </div>
  );
};

export default PlaylistCard;