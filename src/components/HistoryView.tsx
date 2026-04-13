import type { SavedSearch } from '../types';

interface Props {
  history: SavedSearch[];
  onClose: () => void;
  onClearHistory: () => void;
}

export default function HistoryView({ history, onClose, onClearHistory }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a1830] overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            Back
          </button>
          <h2 className="text-xl font-semibold text-white">Search History</h2>
          {history.length > 0 ? (
            <button onClick={onClearHistory} className="text-slate-500 hover:text-red-400 text-xs">
              Clear all
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
        {history.length === 0 && (
          <div className="text-center text-slate-500 mt-24 text-sm">
            No searches yet. Your history will appear here.
          </div>
        )}
        <div className="space-y-6">
          {history.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5">
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">
                  {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-sm text-slate-300">
                  {entry.artists.map(a => a.name).join(', ')}
                </p>
              </div>
              <div className="mb-4">
                <span className="text-xs px-2 py-0.5 rounded-full border border-purple-400/40 text-purple-300 bg-purple-900/20">
                  {entry.obscurityLabel} · {entry.obscurityScore}
                </span>
              </div>
              <div className="space-y-2">
                {entry.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {rec.image ? (
                      <img src={rec.image} alt={rec.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      {rec.spotifyUrl ? (
                        <a href={rec.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-300 hover:text-sky-200 truncate block">
                          {rec.name}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-300 truncate block">{rec.name}</span>
                      )}
                      <span className="text-xs text-slate-500">{rec.genre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
