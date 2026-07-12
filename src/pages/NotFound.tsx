import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="not-found-page">
      {/* Floating particles */}
      <div className="not-found-particles">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="not-found-particle"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -60 - i * 20],
              x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 8)],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated 404 illustration */}
      <motion.div
        className="not-found-illustration"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.1 }}
      >
        <motion.span
          className="not-found-four"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          4
        </motion.span>
        <motion.div
          className="not-found-globe"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" width="100" height="100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--text)" strokeWidth="2" opacity="0.3" />
            <ellipse cx="50" cy="50" rx="20" ry="45" fill="none" stroke="var(--text)" strokeWidth="1.5" opacity="0.2" />
            <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="var(--text)" strokeWidth="1.5" opacity="0.2" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--text)" strokeWidth="2.5" opacity="0.5" />
            {/* Eyes */}
            <motion.circle
              cx="38" cy="42" r="4" fill="var(--text)"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.circle
              cx="62" cy="42" r="4" fill="var(--text)"
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            {/* Mouth - wobbly frown */}
            <motion.path
              d="M 35 62 Q 50 55 65 62"
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ d: ["M 35 62 Q 50 55 65 62", "M 35 60 Q 50 57 65 60", "M 35 62 Q 50 55 65 62"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
        <motion.span
          className="not-found-four"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          4
        </motion.span>
      </motion.div>

      {/* Text */}
      <motion.h2
        className="not-found-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Lost in the void
      </motion.h2>

      <motion.p
        className="not-found-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        The page <code className="not-found-path">{location.pathname}</code> doesn't exist.
      </motion.p>

      {/* Back home button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Link to="/" className="not-found-home-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Take me home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
