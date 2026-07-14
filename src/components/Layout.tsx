import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import '../App.css';

const Layout = ({ children }: { children: ReactNode }) => {
  const { dark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  



  const navItems = [

    { to: '/', label: '/ home', end: true },
    { to: '/projects', label: '/projects' },
    { to: '/articles', label: '/articles' },
    { to: '/guestbook', label: '/guestbook' },
    { to: '/about', label: '/about' },
  ];

  return (
    <div className="portfolio">
      <header className={`header ${menuOpen ? 'open' : ''}`}>
        <div className="header-left">
          <h1>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Oshone Omoh
            </Link>
          </h1>
          <p>frontend developer</p>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            <AnimatePresence mode="wait" initial={false}>
              <motion.svg
                key={dark ? 'moon' : 'sun'}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {dark ? (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </>
                )}
              </motion.svg>
            </AnimatePresence>
          </button>

          {/* Hamburger button - mobile only */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>

          {/* Desktop nav */}
          <nav className="nav-links nav-desktop">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => isActive ? 'nav-active' : ''}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile nav dropdown */}
       </header>

<AnimatePresence>
  {menuOpen && (
    <motion.nav
      className="nav-mobile"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? "nav-active" : "")}
          onClick={() => setMenuOpen(false)}
        >
          {item.label}
        </NavLink>
      ))}
    </motion.nav>
  )}
</AnimatePresence>

<main>
  {children}
</main>




      <footer className="footer">
        <div className="footer-links">
          <a href="https://github.com/vxxious" target="_blank" rel="noopener noreferrer">Code</a>
          <a href="/projects">Build</a>
          <a href="/articles">Debug</a>
        </div>
        <p className="footer-tagline">Be Positive, you're alive :)</p>
      </footer>
    </div>
  );
};

export default Layout;
