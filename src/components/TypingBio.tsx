import React from 'react';
import { motion } from 'framer-motion';

const TypingBio = ({ text }: { text: string }) => {
  const words = text.split(' ');
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <div className="bio-parallax">
    <p className="bio">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: 0.3,
            delay: 0.3 + i * 0.04,
          }}
          style={{
            display: "inline-block",
            marginRight: "0.3em",
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  </div>
);
};

export default TypingBio;
