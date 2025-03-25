'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ReferralStats {
  totalReferrals: number;
  rank: number;
  referralLink: string;
}

interface LeaderboardEntry {
  address: string;
  totalReferrals: number;
}

export const ReferralSystem = () => {
  const { address } = useAccount();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    rank: 0,
    referralLink: ''
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;

      try {
        // Fetch statistiche utente
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/${address}`);
        if (!statsResponse.ok) {
          throw new Error('Errore nel recupero delle statistiche');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch leaderboard
        const leaderboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard`);
        if (!leaderboardResponse.ok) {
          throw new Error('Errore nel recupero della classifica');
        }
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
        console.error('Errore:', err);
      }
    };

    fetchData();
  }, [address]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Errore durante la copia:', err);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Statistiche Personali */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Le tue Statistiche</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Totale Referral:</span>
            <span className="text-white font-bold">{stats.totalReferrals}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Posizione in Classifica:</span>
            <span className="text-white font-bold">#{stats.rank}</span>
          </div>
          <div className="mt-6">
            <p className="text-gray-300 mb-2">Il tuo Link Referral:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={stats.referralLink}
                readOnly
                className="bg-gray-700 text-white p-2 rounded flex-1 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded transition-colors duration-200"
                aria-label="Copia link referral"
              >
                {copied ? 'Copiato!' : 'Copia'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classifica */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Classifica Referral</h2>
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className={`flex justify-between items-center p-3 rounded ${
                entry.address === address ? 'bg-gray-700' : 'bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400">#{index + 1}</span>
                <span className="text-white">
                  {entry.address === address
                    ? 'Tu'
                    : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                </span>
              </div>
              <span className="text-primary font-bold">{entry.totalReferrals}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};