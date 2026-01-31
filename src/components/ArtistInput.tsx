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
    <div className="flex flex-col gap-4 items-center w-full">
      {/* Input + '+' button container */}
      <div className="relative flex items-center w-full sm:w-2/3 group">
        {/* Glow layer */}
        <div
          className="
            absolute -inset-1
            rounded-xl
            pointer-events-none
            bg-purple-600/20
            blur-xl
            opacity-40
          "
        />

        {/* Input + button wrapper */}
        <div className="flex w-full items-center relative rounded-xl overflow-hidden border border-slate-600 bg-[#1c1c28] p-2 gap-2">
          {/* Input box */}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type an artist you love..."
            className="
              flex-1
              h-10 sm:h-12
              bg-transparent
              text-slate-400
              placeholder:text-slate-500
              pl-4
              transition-all duration-200
              focus:outline-none
              focus:shadow-[0_0_24px_rgba(196,181,253,0.35)]
              focus:rounded-tl-xl
              focus:rounded-bl-xl
              transition-shadow duration-200
            "
          />

          {/* '+' button */}
          <button
            onClick={handleAdd}
            className="
              flex-shrink-0
              w-12 h-12
              bg-slate-700
              border border-slate-500
              rounded-lg
              text-white text-xl font-bold
              flex items-center justify-center
              hover:bg-[#1f1f27]
              transition-all duration-200
            "
          >
            +
          </button>
        </div>
      </div>

      {/* Artists count / placeholder text */}
      <p
        key={artists.length}
        className="
          mt-8
          text-center
          text-sm
          text-slate-500
          animate-[pulseSoft_600ms_ease-out]
        "
      >
        {artists.length === 0
          ? 'No artists added yet. Add up to 8 to get started'
          : `${artists.length}/8 artists added`}
      </p>

      {/* List of added artists */}
      <div className="flex flex-wrap gap-2 w-full sm:w-2/3">
        {artists.map(artist => (
          <div
            key={artist.id}
            className="
              relative
              px-4 py-2
              rounded-full
              flex items-center gap-2
              text-slate-300
              bg-[#23233a]
              border border-slate-600
              shadow-[0_0_12px_rgba(168,85,247,0.18)]
              transition-all duration-200
            "
          >
            <span className="text-sm">{artist.name}</span>

            <button
              onClick={() => onRemove(artist.id)}
              className="
                text-slate-400
                text-sm
                px-1
                rounded-full
                hover:text-slate-200
                hover:bg-white/5
                transition-colors
              "
              aria-label={`Remove ${artist.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
