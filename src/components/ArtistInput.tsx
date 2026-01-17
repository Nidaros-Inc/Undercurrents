
import React, { useState } from 'react';
import type { Artist } from '../types';

interface ArtistInputProps {
  artists: Artist[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  maxArtists: number;
}

const ArtistInput: React.FC<ArtistInputProps> = ({ artists, onAdd, onRemove, maxArtists }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && artists.length < maxArtists) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={artists.length >= maxArtists}
          placeholder={artists.length >= maxArtists ? "Max artists reached" : "Type an artist you love..."}
          className="w-full bg-slate-800/50 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg placeholder:text-slate-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || artists.length >= maxArtists}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300"
          >
            <span className="font-medium">{artist.name}</span>
            <button
              onClick={() => onRemove(artist.id)}
              className="hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        ))}
        {artists.length === 0 && (
          <p className="text-slate-500 italic text-center w-full py-4">
            No artists added yet. Add up to {maxArtists} to get started.
          </p>
        )}
      </div>

      <div className="text-center">
        <span className="text-sm text-slate-400">
          {artists.length} / {maxArtists} artists added
        </span>
      </div>
    </div>
  );
};

export default ArtistInput;
