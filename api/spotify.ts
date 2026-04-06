import type { VercelRequest, VercelResponse } from "@vercel/node";

let accessToken: string | null = null;
let tokenExpires = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpires) {
    return accessToken;
  }
  const credentials = Buffer.from(
    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
  ).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000;
  return accessToken;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { artist } = req.query;

  if (!artist) {
    return res.status(400).json({ error: "Artist name required" });
  }

  const token = await getAccessToken();

const response = await fetch(
  `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist as string)}&type=artist&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  const results = data.artists?.items;

  if (!results || results.length === 0) {
    return res.status(404).json({ error: "Artist not found" });
  }

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetName = normalize(artist as string);

  // Filter to name matches only
  const nameMatches = results.filter((a: any) => normalize(a.name) === targetName);

  if (nameMatches.length === 0) {
    return res.status(404).json({ error: "No matching artist found" });
  }

  if (nameMatches.length === 1) {
    // Only one match — use it
    return res.status(200).json({
      spotifyUrl: nameMatches[0].external_urls.spotify,
      image: nameMatches[0].images?.[0]?.url || null,
    });
  }

  // Multiple matches with same name — try to find best match
const recommendedGenre = ((req.query.genre as string) || '').toLowerCase();
const recommendedDecade = ((req.query.decade as string) || '').toLowerCase();
const recommendedCountry = ((req.query.country as string) || '').toLowerCase();

const scored = nameMatches.map((a: any) => {
  let score = 0;
  const artistGenres: string[] = a.genres || [];
  const genreString = artistGenres.join(' ').toLowerCase();

  // Prefer lower popularity
  if (a.popularity < 75) score += 2;
  if (a.popularity < 50) score += 2;

  // Boost if Spotify genres contain any words from recommended genre
  if (recommendedGenre) {
    const genreWords = recommendedGenre.split(/[\s,\/]+/);
    genreWords.forEach((word: string) => {
      if (word.length > 3 && genreString.includes(word)) {
        score += 3;
      }
    });
  }

  // Boost if genres hint at correct decade
  if (recommendedDecade) {
    const dec = recommendedDecade.replace('s', '');
    if (genreString.includes(dec)) score += 3;
  }

  // Boost if genres hint at country
  if (recommendedCountry) {
    if (genreString.includes(recommendedCountry)) score += 3;
  }

  return { artist: a, score };
});

scored.sort((x: { artist: any; score: number }, y: { artist: any; score: number }) => y.score - x.score);


const result = scored[0].artist;

return res.status(200).json({
  spotifyUrl: result.external_urls.spotify,
  image: result.images?.[0]?.url || null,
});
}