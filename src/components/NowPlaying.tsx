import { useState, useEffect } from 'react';
import { Music, AlertCircle } from 'lucide-react';
import { FastAverageColor } from "fast-average-color";
import { supabase } from '@/integrations/supabase/client';


type Track = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string | null;
  url?: string | null;

  progressMs?: number;
  durationMs?: number;
};

type NowPlayingState =
  | { kind: 'loading' }
  | { kind: 'playing'; track: Track }
  | { kind: 'idle' }
  | { kind: 'error'; message: string };

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
  </svg>
);

const formatTime = (milliseconds = 0) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Equalizer = () => (
  <span className="np-equalizer" aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

const NowPlaying = () => {
  const [state, setState] = useState<NowPlayingState>({ kind: 'idle' });
  const [progressMs, setProgressMs] = useState(0);
  const [accentColor, setAccentColor] = useState("#1DB954");

useEffect(() => {
  if (state.kind !== "playing" || !state.track.albumArt) {
    setAccentColor("#1DB954");
    return;
  }

  const fac = new FastAverageColor();

  fac
    .getColorAsync(state.track.albumArt)
    .then((color) => {
      setAccentColor(color.hex);
    })
    .catch(() => {
      setAccentColor("#1DB954");
    });

  return () => {
    fac.destroy();
  };
}, [state]);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        console.log("Calling Spotify function...");

const { data, error } = await supabase.functions.invoke("spotify-now-playing");

console.log("Response:", data);
console.log("Error:", error);
        if (error) {
          setState({ kind: 'error', message: 'Could not reach Spotify' });
          return;
        }
        if (data && data.title) {
          setState({
            kind: 'playing',
           track: {
  isPlaying: data.isPlaying ?? false,
  title: data.title,
  artist: data.artist,
  album: data.album,
  albumArt: data.albumArt,
  url: data.url,
  progressMs: data.progressMs,
  durationMs: data.durationMs,
            },
          });
          setProgressMs(data.progressMs ?? 0);
        } else {
          setState({ kind: 'idle' });
        }
      } catch {
        setState({ kind: 'error', message: 'Could not reach Spotify' });
      }
    };


    setState({ kind: 'loading' });
    fetchNowPlaying();


const id = setInterval(fetchNowPlaying, 30000);

return () => clearInterval(id);
  }, []);

  useEffect(() => {
  if (state.kind !== "playing") return;
  if (!state.track.isPlaying) return;

  const timer = setInterval(() => {
    setProgressMs((prev) =>
  Math.min(prev + 1000, state.track.durationMs ?? prev)
);
  }, 1000);

  return () => clearInterval(timer);
}, [state]);

  if (state.kind === 'idle') {
    return (
      <div className="now-playing">
        <div className="np-inner np-inner-muted">
          <div className="np-art np-art-fallback">
            <Music size={18} />
          </div>
          <div className="np-meta">
            <div className="np-status">
              <span className="np-dot" />
              Not listening
            </div>
            <div className="np-title np-title-muted">Nothing playing right now</div>
          </div>
          <SpotifyIcon className="np-spotify" />
        </div>
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <div className="now-playing">
        <div className="np-inner np-inner-muted">
          <div className="np-art np-art-fallback np-art-error">
            <AlertCircle size={18} />
          </div>
          <div className="np-meta">
            <div className="np-status">
              <span className="np-dot np-dot-error" />
              Error
            </div>
            <div className="np-title np-title-muted">{state.message}</div>
          </div>
          <SpotifyIcon className="np-spotify" />
        </div>
      </div>
    );
  }

  if (state.kind === 'loading') {
    return (
      <div className="now-playing">
        <div className="np-inner np-inner-muted">
          <div className="np-art np-art-fallback np-art-loading" />
          <div className="np-meta">
            <div className="np-status">
              <span className="np-dot np-dot-loading" />
              Loading
            </div>
            <div className="np-title np-title-muted">Fetching playback...</div>
          </div>
          <SpotifyIcon className="np-spotify" />
        </div>
      </div>
    );
  }

 const track = state.track;

const progress =
  progressMs > 0 &&
  track.durationMs
    ? (progressMs / track.durationMs) * 100
    : 0;

const inner = (
  <>
    {track.albumArt ? (
      <img
        src={track.albumArt}
        alt={track.album ?? ""}
        className="np-art"
      />
    ) : (
      <div className="np-art np-art-fallback">
        <Music size={18} />
      </div>
    )}

    <div className="np-meta">
      <div className="np-status">
        {track.isPlaying ? <Equalizer /> : <span className="np-dot" />}
        {track.isPlaying ? "Now playing" : "Last played"}
      </div>

      <div className="np-title">{track.title}</div>
      <div className="np-artist">{track.artist}</div>

      <div className="np-progress">
        <div
          className="np-progress-fill"
          style={{ 
            width: `${progress}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
      <div className="np-timing" aria-label="Track progress">
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(track.durationMs)}</span>
      </div>
    </div>

    <SpotifyIcon className="np-spotify" />
  </>
);

return (
  <div className="now-playing">
    {track.url ? (
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className="np-inner"
        style={
          {
            "--accent-color": accentColor,
          } as React.CSSProperties
        }
      >
        {inner}
      </a>
    ) : (
      <div
        className="np-inner"
        style={
          {
            "--accent-color": accentColor,
          } as React.CSSProperties
        }
      >
        {inner}
      </div>
    )}
  </div>
);
};

export default NowPlaying;
