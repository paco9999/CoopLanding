import React from 'react';
import { ConnectButton } from './components/ConnectButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6">
          Benvenuto nella Coop
        </h1>
        <p className="text-gray-300 text-xl mb-12">
          Connetti il tuo wallet per accedere alla piattaforma e scoprire tutte le funzionalità
        </p>
        <ConnectButton />
      </div>
    </main>
  );
} 