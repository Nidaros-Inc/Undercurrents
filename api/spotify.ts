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
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist as string)}&type=artist&limit=5`,
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

  // Prefer artists with popularity under 75 to avoid famous mismatches
  // but always fall back to first result so something is returned
  const preferredResult = results.find((a: any) => a.popularity < 75);
  const result = preferredResult || results[0];

  return res.status(200).json({
    spotifyUrl: result.external_urls.spotify,
    image: result.images?.[0]?.url || null,
  });
}