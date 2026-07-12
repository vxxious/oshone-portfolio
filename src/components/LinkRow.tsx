import React from 'react';
import { motion } from 'framer-motion';
import ExternalArrow from './ExternalArrow';

interface LinkRowProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  index?: number;
}

const LinkRow = ({ icon, label, href, index = 0 }: LinkRowProps) => (
  <motion.a
    className="link-row"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.35, delay: 1.2 + index * 0.1, ease: 'easeOut' }}
  >
    <span className="link-icon">{icon}</span>
    <span className="link-label">{label}</span>
    <ExternalArrow />
  </motion.a>
);

export default LinkRow;
