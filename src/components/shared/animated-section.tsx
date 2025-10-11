
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type AnimatedSectionProps = {
  children: ReactNode;
};

export function AnimatedSection({ children }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
