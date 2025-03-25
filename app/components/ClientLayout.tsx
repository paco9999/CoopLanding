'use client';

import React, { useState, useEffect } from 'react';
import { Providers } from '../providers';

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Providers>{children}</Providers>;
} 