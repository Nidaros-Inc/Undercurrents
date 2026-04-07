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

  const { artistId } = req.query;

  if (!artistId) {
    return res.status(400).json({ error: "Artist ID required" });
  }

  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=GB`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!data.tracks || data.tracks.length === 0) {
    return res.status(404).json({ error: "No tracks found" });
  }

  const tracks = data.tracks.slice(0, 2).map((track: any) => ({
    name: track.name,
    spotifyUrl: track.external_urls.spotify,
    albumArt: track.album.images?.[0]?.url || null,
    albumName: track.album.name,
    previewUrl: track.preview_url || null,
  }));

  return res.status(200).json({ tracks });
}