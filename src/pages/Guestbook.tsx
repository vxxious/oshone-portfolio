import { useEffect, useRef, useState, FormEvent } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

import SignaturePad, { SignaturePadHandle } from '@/components/SignaturePad';
import '../styles/guestbook.css';


const entrySchema = z.object({
  display_name: z.string().trim().min(1, 'Name is required').max(100),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

interface Entry {
  id: string;
  avatar_url: string | null;
  display_name: string;
  message: string;
  signature_svg: string | null;
  created_at: string;
}

const getDisplayName = (user: User) => {
  const metadata = user.user_metadata;
  const name = metadata.full_name ?? metadata.name ?? metadata.user_name ?? metadata.preferred_username;

  return typeof name === 'string' && name.trim()
    ? name.trim().slice(0, 100)
    : user.email?.split('@')[0] ?? 'Guest';
};

const getAvatarUrl = (user: User) => {
  const metadata = user.user_metadata;
  const avatarUrl = metadata.avatar_url ?? metadata.picture;

  return typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl : null;
};

const Avatar = ({ name, src, size = 'default' }: { name: string; src: string | null; size?: 'default' | 'small' }) => (
  <span className={`guestbook-avatar guestbook-avatar-${size}`} aria-hidden="true">
    <span>{name.trim().charAt(0).toUpperCase() || '?'}</span>
    {src && <img src={src} alt="" referrerPolicy="no-referrer" />}
  </span>
);

const Guestbook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<'google' | 'github' | null>(null);


  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const padRef = useRef<SignaturePadHandle>(null);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  // SEO
  useEffect(() => {
    document.title = 'Guestbook — Oshone Omoh';
    const desc = 'Leave a note and a signature in the guestbook.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) setDisplayName((current) => current || getDisplayName(nextUser));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthLoading(null);
      if (nextUser) setDisplayName((current) => current || getDisplayName(nextUser));
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load entries
  const loadEntries = async () => {
    setLoadingEntries(true);
    const { data, error } = await supabase
      .from('guestbook_entries')
      .select('id, avatar_url, display_name, message, signature_svg, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) toast.error('Could not load entries');
    else setEntries(data ?? []);
    setLoadingEntries(false);
  };
  useEffect(() => {
    loadEntries();
  }, []);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setAuthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/guestbook` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${provider === 'google' ? 'Google' : 'GitHub'} sign-in failed`);
      setAuthLoading(null);
    }
  };


  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Could not sign out. Please try again.');
      return;
    }
    setUser(null);
    setDisplayName('');
    toast.success('Signed out.');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const currentUser = authData.user;
    if (authError || !currentUser) {
      toast.error('Please sign in before signing the guestbook.');
      return;
    }
    const parsed = entrySchema.safeParse({ display_name: displayName, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const signature_svg = padRef.current?.toSVG() ?? null;
      const { error } = await supabase.from('guestbook_entries').insert({
        user_id: currentUser.id,
        avatar_url: getAvatarUrl(currentUser),
        display_name: parsed.data.display_name,
        message: parsed.data.message,
        signature_svg,
      });
      if (error) throw error;
      toast.success('Signed the guestbook.');
      setMessage('');
      padRef.current?.clear();
      loadEntries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="guestbook">
      <header className="guestbook-header">
        <h1>Guestbook</h1>
        <p>Leave a note. Draw a signature if you feel like it.</p>
      </header>

      {!user ? (
        <div className="guestbook-auth">
          <p className="muted">Sign in to leave a note.</p>
          <button
            type="button"
            className="oauth-btn"
            onClick={() => handleOAuth('google')}
            disabled={authLoading !== null}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {authLoading === 'google' ? 'Opening…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            className="oauth-btn"
            onClick={() => handleOAuth('github')}
            disabled={authLoading !== null}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.77 1.06.77 2.15v3.19c0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.74 18.27.5 12 .5z"/>
            </svg>
            {authLoading === 'github' ? 'Opening…' : 'Continue with GitHub'}
          </button>
        </div>
      ) : (

        <form className="guestbook-form" onSubmit={handleSubmit}>
          <div className="guestbook-signed-in">
            <div className="guestbook-user">
              <Avatar name={getDisplayName(user)} src={getAvatarUrl(user)} size="small" />
              <span>Signed in as <strong>{getDisplayName(user)}</strong></span>
            </div>
            <button type="button" onClick={handleSignOut} className="linklike">Sign out</button>
          </div>
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            required
          />
          <textarea
            placeholder="Your message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            required
          />
          <div className="signature-wrap">
            <div className="signature-label">
              <span>Signature (optional)</span>
              <button type="button" className="linklike" onClick={() => padRef.current?.clear()}>Clear</button>
            </div>
            <SignaturePad ref={padRef} />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing…' : 'Sign the guestbook →'}
          </button>
        </form>
      )}

      <div className="guestbook-entries">
        <h2>Recent entries</h2>
        {loadingEntries ? (
          <p className="muted">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="muted">No entries yet. Be the first.</p>
        ) : (
          <ul>
            {entries.map((e) => (
              <li key={e.id} className="entry">
                <div className="entry-head">
                  <div className="entry-author">
                    <Avatar name={e.display_name} src={e.avatar_url} />
                    <strong>{e.display_name}</strong>
                  </div>
                  <time>{new Date(e.created_at).toLocaleDateString()}</time>
                </div>
                <p className="entry-message">{e.message}</p>
                {e.signature_svg && (
                  <div
                    className="entry-signature"
                    aria-label={`Signature by ${e.display_name}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeSignatureSvg(e.signature_svg) }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

function sanitizeSignatureSvg(svg: string): string {
  const paths = Array.from(svg.matchAll(/<path\s+[^>]*\bd="([ML0-9,.\s-]+)"[^>]*>/gi))
    .map((match) => match[1])
    .filter((path) => /^M[ML0-9,.\s-]+$/.test(path));

  if (!paths.length) return '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 160">${paths
    .map((path) => `<path d="${path}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`)
    .join('')}</svg>`;
}

export default Guestbook;
