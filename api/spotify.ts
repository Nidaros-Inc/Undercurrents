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

  const recommendedGenre = ((req.query.genre as string) || '').toLowerCase();
  const recommendedCountry = ((req.query.country as string) || '').toLowerCase();

  const token = await getAccessToken();

  // Build a specific search query using genre and country to help disambiguation
  const searchQuery = [artist, recommendedGenre, recommendedCountry]
    .filter(Boolean)
    .join(' ');

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=10`,
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

  // Filter to exact name matches only
  const nameMatches = results.filter((a: any) => normalize(a.name) === targetName);

  if (nameMatches.length === 0) {
    return res.status(404).json({ error: "No matching artist found" });
  }

if (nameMatches.length === 1) {
    return res.status(200).json({
      spotifyUrl: nameMatches[0].external_urls.spotify,
      spotifyId: nameMatches[0].id,
      image: nameMatches[0].images?.[0]?.url || null,
    });
  }

  // Multiple exact name matches — ambiguous, discard entirely
  return res.status(404).json({ error: "Ambiguous artist name" });
}