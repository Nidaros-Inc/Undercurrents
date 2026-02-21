import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  const { artist } = req.query;

  if (!artist) {
    return res.status(400).json({ error: "Artist name required" });
  }

  const token = await getAccessToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      artist as string
    )}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  const result = data.artists.items[0];

  if (!result) {
    return res.status(404).json({ error: "Artist not found" });
  }

  return res.status(200).json({
  spotifyUrl: result.external_urls.spotify,
  image: result.images?.[0]?.url || null
});
}
