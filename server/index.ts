import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { body, param, validationResult } from 'express-validator';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Interfacce
interface ReferralRequest {
  referrerAddress: string;
  referredAddress: string;
}

// Invece di utilizzare il tipo generico AddressParams, usiamo i tipi standard di Express
type RequestWithAddress = Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;
type RequestWithReferral = Request<ParamsDictionary, any, ReferralRequest, ParsedQs, Record<string, any>>;

const prisma = new PrismaClient();
const app = express();

// Configurazione CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permetti richieste senza origin (es. chiamate da Postman o curl)
    if (!origin) return callback(null, true);
    
    // Permetti tutte le richieste da localhost su qualsiasi porta
    if (origin.match(/^http:\/\/localhost(:\d+)?$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware di sicurezza
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // limite di 100 richieste per finestra
});
app.use(limiter);

// Compressione GZIP
app.use(compression());

app.use(express.json({ limit: '10kb' })); // Limite dimensione JSON

// Middleware per la validazione
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Verifica se un indirizzo è valido
const isValidAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// API per ottenere le statistiche di un utente
app.get('/api/stats/:address',
  param('address').isString().custom(isValidAddress),
  handleValidationErrors,
  async (req: RequestWithAddress, res: Response, next: NextFunction) => {
    try {
      const { address } = req.params;
      
      // Trova o crea l'utente
      const user = await prisma.user.upsert({
        where: { address: address.toLowerCase() },
        update: {},
        create: {
          address: address.toLowerCase(),
          totalReferrals: 0
        }
      });

      // Calcola il rank
      const allUsers = await prisma.user.findMany({
        orderBy: { totalReferrals: 'desc' }
      });
      
      const rank = allUsers.findIndex((u: { id: any; }) => u.id === user.id) + 1;

      res.json({
        totalReferrals: user.totalReferrals,
        rank,
        referralLink: `${process.env.NEXT_PUBLIC_SITE_URL}/join?ref=${address}`
      });
    } catch (error) {
      next(error);
    }
});

// API per ottenere la classifica
app.get('/api/leaderboard',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { totalReferrals: 'desc' },
        take: 10,
        select: {
          address: true,
          totalReferrals: true
        }
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
});

// API per registrare un nuovo referral
app.post('/api/referral',
  [
    body('referrerAddress').isString().custom(isValidAddress),
    body('referredAddress').isString().custom(isValidAddress)
  ],
  handleValidationErrors,
  async (req: RequestWithReferral, res: Response, next: NextFunction) => {
    try {
      const { referrerAddress, referredAddress } = req.body;

      // Verifica che non sia un self-referral
      if (referrerAddress.toLowerCase() === referredAddress.toLowerCase()) {
        res.status(400).json({ error: 'Non puoi invitare te stesso' });
        return;
      }

      // Trova o crea il referrer
      const referrer = await prisma.user.upsert({
        where: { address: referrerAddress.toLowerCase() },
        update: {},
        create: {
          address: referrerAddress.toLowerCase(),
          totalReferrals: 0
        }
      });

      // Verifica se l'utente invitato esiste già
      const existingReferred = await prisma.user.findUnique({
        where: { address: referredAddress.toLowerCase() }
      });

      if (existingReferred) {
        res.status(400).json({ error: 'Utente già registrato' });
        return;
      }

      // Crea il nuovo utente invitato
      const referred = await prisma.user.create({
        data: {
          address: referredAddress.toLowerCase(),
          referredBy: referrer.id
        }
      });

      // Crea il referral
      const referral = await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: referred.id,
          status: 'COMPLETED'
        }
      });

      // Aggiorna il conteggio dei referral del referrer
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          totalReferrals: { increment: 1 }
        }
      });

      res.json({ success: true, referral });
    } catch (error) {
      next(error);
    }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Errore:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
}); 