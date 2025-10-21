// api/spotify-callback.js
// This file handles the Spotify OAuth token exchange

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI || 'https://mood-tunes-three.vercel.app/callback';

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Exchange code for access token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify token error:', data);
      return res.status(response.status).json(data);
    }

    // Return the token to the frontend
    res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}
