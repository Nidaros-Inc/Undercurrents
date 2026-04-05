import { Capacitor } from "@capacitor/core";
import type { Artist, RecommendationResponse } from "../types";

const API_BASE =
  Capacitor.getPlatform() === "web"
    ? ""
    : "https://undercurrents-umber.vercel.app";

const PROMPT_TEMPLATE = (artistNames: string) => `I like the following music artists: ${artistNames}.
Please suggest 5 music artists that are genuinely obscure, underground, or cult favourites — artists that most music fans will never have heard of. Avoid any artist that has had mainstream chart success, significant radio play, or widespread name recognition. Think deep cuts — artists with small but dedicated followings, released on independent labels, or known only within specific music communities.
IMPORTANT: Only recommend artists that genuinely exist and have a real presence on Spotify. Do not invent, approximate, or hallucinate artist names. Every artist you recommend must be a real, verifiable musician or band that can be found by searching their exact name on Spotify.
The suggestions should be stylistically related to my favorites but offer something unique and potentially undiscovered.
Also generate an overall obscurityScore (40-98) representing how eclectic and obscure the user's taste is — scores should be generous and flattering, minimum 40, and reflect genuine musical adventurousness. Also generate a short obscurityLabel (e.g. "Deeply underground", "Cult connoisseur", "Hidden gem hunter").
Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "obscurityScore": 94,
  "obscurityLabel": "Cult connoisseur",
  "recommendations": [
    {
      "name": "Artist Name",
      "genre": "Genre",
      "country": "Country of origin",
      "decade": "1980s",
      "description": "Short bio or style description",
      "whyYouWillLikeIt": "Why this matches the user's taste",
      "obscurityLevel": 8
    }
  ]
}
Ensure obscurityLevel is mostly 7-10. Return exactly 5 recommendations.`;

export async function getRecommendations(seedArtists: Artist[]): Promise<RecommendationResponse> {
  const artistNames = seedArtists.map(a => a.name).join(", ");
  try {
    const geminiRes = await fetch(`${API_BASE}/api/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: PROMPT_TEMPLATE(artistNames) }),
    });

    if (!geminiRes.ok) throw new Error("Gemini backend call failed");
    const geminiData = await geminiRes.json();
    const parsed = JSON.parse(geminiData.text.trim()) as RecommendationResponse;

    const enrichedRecommendations = await Promise.all(
      parsed.recommendations.map(async (rec) => {
        try {
          const spotifyRes = await fetch(
  `${API_BASE}/api/spotify?artist=${encodeURIComponent(rec.name)}&country=${encodeURIComponent(rec.country || '')}&decade=${encodeURIComponent(rec.decade || '')}`
);
          if (!spotifyRes.ok) return rec;
          const spotifyData = await spotifyRes.json();
          return {
            ...rec,
            spotifyUrl: spotifyData.spotifyUrl || null,
            image: spotifyData.image || null,
          };
        } catch {
          return rec;
        }
      })
    );

    return {
      recommendations: enrichedRecommendations,
      obscurityScore: parsed.obscurityScore,
      obscurityLabel: parsed.obscurityLabel,
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
}
