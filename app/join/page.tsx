'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '../components/ConnectButton';

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const referralAddress = searchParams.get('ref');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const registerReferral = async () => {
      if (isConnected && address && referralAddress) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referral`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referrerAddress: referralAddress,
              referredAddress: address,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Errore nella registrazione del referral');
          }

          // Redirect alla dashboard dopo la registrazione
          router.push('/dashboard');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
          console.error('Errore:', err);
        }
      } else if (isConnected && !referralAddress) {
        // Se non c'è un referral, vai direttamente alla dashboard
        router.push('/dashboard');
      }
    };

    registerReferral();
  }, [isConnected, address, referralAddress, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">
          Benvenuto nella Coop
        </h1>
        {referralAddress && (
          <p className="text-gray-300 text-lg mb-8">
            Sei stato invitato da: {referralAddress.slice(0, 6)}...{referralAddress.slice(-4)}
          </p>
        )}
        {error && (
          <p className="text-red-500 mb-8">
            {error}
          </p>
        )}
        <p className="text-gray-300 text-xl mb-8">
          Connetti il tuo wallet per iniziare
        </p>
        <ConnectButton />
      </div>
    </main>
  );
} 