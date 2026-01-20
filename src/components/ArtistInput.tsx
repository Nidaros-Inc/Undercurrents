import { useState } from 'react';
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
    <div className="flex flex-col gap-4 items-center">
   {/* Input + '+' button container */}
<div className="relative flex items-center w-2/3 group">
  {/* Glow container */}
  <div className="absolute -inset-1 rounded-xl pointer-events-none
                bg-purple-600/20
                blur-xl
                opacity-40"></div>

  {/* Input + button wrapper with uniform padding */}
  <div className="flex w-full items-center relative rounded-xl overflow-hidden border border-slate-600 bg-[#1c1c28] p-2">
    {/* Input box */}
    <input
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="Type an artist you love..."
      className="
        flex-1
        h-12
        bg-transparent
        text-slate-400
        placeholder:text-slate-500
        pl-4
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-40
      "
    />

    {/* '+' button with equal top, bottom, right spacing */}
    <button
      onClick={handleAdd}
      className="
        w-12 h-12
        mr-2
        bg-slate-700
        border border-slate-500
        rounded-lg
        text-white text-xl font-bold
        flex items-center justify-center
        hover:bg-purple-700 hover:bg-opacity-30
        transition-all duration-200
      "
    >
      +
    </button>
  </div>
</div>
   {artists.length === 0 && (
  <div className="mt-6 text-center text-slate-500 italic text-sm">
    No artists added yet. Add up to {maxArtists} to get started.
  </div>
)}
      {/* List of added artists */}
      <div className="flex flex-wrap gap-2 w-2/3">
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
