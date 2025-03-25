'use client';

import React from 'react';
import { WagmiConfig } from 'wagmi';
import { config } from './config/wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      {children}
    </WagmiConfig>
  );
} 