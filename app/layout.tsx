import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata';
import { ClientLayout } from './components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 