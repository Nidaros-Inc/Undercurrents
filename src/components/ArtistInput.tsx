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
    <div className="flex flex-col gap-4">
      {/* Input + '+' button */}
      <div className="relative flex items-center w-2/3 mx-auto mt-6">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type an artist you love..."
          className="
            flex-1
            h-14
            h-16 
          rounded-xl
            bg-[#1c1c28]
            border border-slate-400
            text-slate-300
            placeholder:text-slate-400
            shadow-[0_6px_24px_rgba(88,28,135,0.25)]
            focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-opacity-40
            pl-4 pr-14
            transition-all duration-200
          "
        />
        <button
          onClick={handleAdd}
          className="
            absolute right-1 top-1/2 -translate-y-1/2
            w-14 h-14 rounded-xl
            bg-transparent border border-slate-400
            rounded-lg
            text-white text-xl font-bold
            flex items-center justify-center
            hover:bg-purple-700 hover:bg-opacity-20
            transition-all duration-200
          "
        >
          +
        </button>
      </div>

      {/* List of added artists */}
      <div className="flex flex-wrap gap-2 w-2/3 mx-auto">
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
