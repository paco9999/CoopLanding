'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ReferralSystem } from '../components/ReferralSystem';

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/');
    }
  }, [isConnected, router, mounted]);

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Dashboard
          </h1>
          {address && (
            <p className="text-gray-300 text-lg">
              Wallet connesso: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Sistema Referral */}
        <ReferralSystem />
      </div>
    </main>
  );
} 