import { useState, useEffect } from 'react';
import '../App.css';
import TypingBio from '@/components/TypingBio';
import LinkRow from '@/components/LinkRow';
import NowPlaying from '@/components/NowPlaying';
import ContactSection from '@/components/ContactSection';

import PageSkeleton from '@/components/PageSkeleton';

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      {/* Bio */}
      <TypingBio text="Frontend developer specializing in React, TypeScript, and modern web technologies. I build fast, accessible, and responsive web applications." />

      {/* Links Card */}
      <div className="links-card">
        <LinkRow
          index={0}
          href="https://www.linkedin.com/in/oshone-omoh-95033830b"
          label="LinkedIn"
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0077b5">
              <rect width="24" height="24" rx="4" fill="#0077b5" />
              <path d="M8 19H5V10h3v9zM6.5 8.5A1.5 1.5 0 1 1 8 7a1.5 1.5 0 0 1-1.5 1.5zM19 19h-3v-4.5c0-1.1-.4-1.8-1.4-1.8-.8 0-1.2.5-1.4 1-.1.2-.1.4-.1.6V19h-3s0-8 0-9h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.2 1.3 3.2 4V19z" fill="white" />
            </svg>
          }
        />
        <LinkRow
          index={1}
          href="https://github.com/vxxious"
          label="GitHub"
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" className="github-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.75c0 .27.16.58.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
            </svg>
          }
        />
        <LinkRow
          index={2}
          href="https://x.com/oshoneomoh"
          label="X (formerly Twitter)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" className="x-icon">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          }
        />
        <LinkRow
          index={3}
          href="https://substack.com/@1oshone"
          label="Substack"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF6719">
              <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v10l-9-5-9 5V11z" />
            </svg>
          }
        />
        <LinkRow
          index={4}
          href="https://www.instagram.com/vxxious.10x"
          label="Instagram"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C" stroke="none" />
            </svg>
          }
        />
        
      <NowPlaying />
      </div>

      {/* Bottom */}
      <div className="bottom-section">
        <div className="bottom-left">
          <div className="email-row">
            <span>omohoshone5@gmail.com</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div className="online-pill">
            <span className="online-dot"></span>
            Online
          </div>
        </div>
       <a
  href="/oshone-omoh-cv.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className="cv-button"
>
  Download my CV
</a>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </a>
      </div>

      {/* Contact Section */}
      <ContactSection />

    </>

  );
};

export default Index;
