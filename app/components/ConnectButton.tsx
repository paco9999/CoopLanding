'use client';
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

export const ConnectButton = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Errore durante la connessione:', error);
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 ease-in-out"
      aria-label="Connetti il wallet"
    >
      Connetti Wallet
    </button>
  );
}; 