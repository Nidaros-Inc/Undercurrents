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

  const { artist, genre } = req.query;

  if (!artist) {
    return res.status(400).json({ error: "Artist name required" });
  }

  const token = await getAccessToken();

  // Build search query — include genre if provided to reduce mismatches
  const searchQuery = genre
    ? `${artist as string} genre:${genre as string}`
    : (artist as string);

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=5`,
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

  // Filter out high-popularity artists (likely famous mismatches)
  // Obscure artists typically score below 50
  const obscureResults = results.filter((a: any) => a.popularity < 75);
// Use first obscure result, fall back to first result if none pass filter
const result = obscureResults[0] || results[0];
if (!result) {
  return res.status(404).json({ error: "Artist not found" });
}

  return res.status(200).json({
    spotifyUrl: result.external_urls.spotify,
    image: result.images?.[0]?.url || null,
  });
}