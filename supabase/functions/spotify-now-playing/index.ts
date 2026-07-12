import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const REFRESH_TOKEN = Deno.env.get('SPOTIFY_REFRESH_TOKEN');

async function getAccessToken(): Promise<string> {
  const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN!,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed [${res.status}]: ${body}`);
  }

  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      throw new Error('Spotify secrets are not configured');
    }

    const token = await getAccessToken();

    // CURRENTLY PLAYING
    const current = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Current status:', current.status);

    const currentBody = await current.text();
    console.log('Current body:', currentBody);

    let payload: Record<string, unknown> = {
      isPlaying: false,
    };

    if (current.status === 200 && currentBody) {
      const data = JSON.parse(currentBody);

      if (data.item) {
        payload = {
          isPlaying: !!data.is_playing,
          title: data.item.name,
          artist: data.item.artists
            .map((a: { name: string }) => a.name)
            .join(', '),
          album: data.item.album?.name,
          albumArt: data.item.album?.images?.[0]?.url ?? null,
          url: data.item.external_urls?.spotify ?? null,
          progressMs: data.progress_ms,
          durationMs: data.item.duration_ms,
        };
      }
    }

    // RECENTLY PLAYED
    if (!('title' in payload)) {
      const recent = await fetch(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Recent status:', recent.status);

      const recentBody = await recent.text();
      console.log('Recent body:', recentBody);

      if (recent.ok) {
        const data = JSON.parse(recentBody);

        const track = data.items?.[0]?.track;

        if (track) {
          payload = {
            isPlaying: false,
            title: track.name,
            artist: track.artists
              .map((a: { name: string }) => a.name)
              .join(', '),
            album: track.album?.name,
            albumArt: track.album?.images?.[0]?.url ?? null,
            url: track.external_urls?.spotify ?? null,
            progressMs: 0,
            durationMs: track.duration_ms,
          };
        }
      }
    }

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    console.error('spotify-now-playing error:', message);

    return new Response(
      JSON.stringify({
        error: message,
        isPlaying: false,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});