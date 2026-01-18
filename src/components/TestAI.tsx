import { useEffect } from 'react';
import { getRecommendations } from '../services/geminiService';
import type { Artist } from '../types';

export default function TestAI() {
  useEffect(() => {
    async function test() {
      try {
        const testArtists: Artist[] = [
          { id: '1', name: 'Radiohead' },
          { id: '2', name: 'Sufjan Stevens' },
        ];

        const response = await getRecommendations(testArtists);
        console.log('AI Test Response:', response);
      } catch (err) {
        console.error('AI Test Error:', err);
      }
    }

    test();
  }, []);

  return (
    <div className="p-4 bg-indigo-800 text-white rounded-xl">
      Check the console for AI test results
    </div>
  );
}
