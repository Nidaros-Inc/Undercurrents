
import React, { useState } from 'react';
import type { Artist } from '../types';

type Props = {
  artists: Artist[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  maxArtists: number;
};

export default function ArtistInput({ artists, onAdd, onRemove, maxArtists }: Props) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (!input.trim() || artists.length >= maxArtists) return;
    onAdd(input.trim());
    setInput('');
  };

  return (
    <div className="space-y-4">
      {/* Input and Add Button */}
      <div className="flex gap-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add an artist"
          className="flex-1 px-4 py-2 rounded-2xl text-black"
        />
        <button
          onClick={handleAdd}
          className="bg-indigo-600 px-6 py-2 rounded-2xl text-white hover:bg-indigo-500 transition-colors"
        >
          Add
        </button>
      </div>

      {/* List of added artists */}
      <div className="flex flex-wrap gap-2">
        {artists.map(artist => (
          <div
            key={artist.id}
            className="bg-purple-700 px-4 py-2 rounded-full flex items-center gap-2"
          >
            <span>{artist.name}</span>
            <button
              onClick={() => onRemove(artist.id)}
              className="text-white font-bold px-2 rounded-full hover:bg-purple-500 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
