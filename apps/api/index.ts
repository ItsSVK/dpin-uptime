import express from 'express';
import { authMiddleware } from './middleware';
import { prismaClient } from 'db/client';
import cors from 'cors';
import { Transaction, SystemProgram, Connection } from '@solana/web3.js';
import type { Website } from '@prisma/client';
const connection = new Connection('https://api.mainnet-beta.solana.com');
const app = express();

app.use(cors());
app.use(express.json());

function formatUrl(url: string) {
  // format the url also check for trailing slashes and www
  url = url.startsWith('http') ? url : `https://${url}`;
  if (!url.endsWith('/')) {
    url += '/';
  }

  if (url.includes('www.')) {
    url = url.replace('www.', '');
  }

  return url;
}

app.post(
  '/api/v1/website',
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    const userId = req.userId!;
    let { url } = req.body;

    let website: Website | null = null;

    url = formatUrl(url);

    // Check if the website is already monitored
    website = await prismaClient.website.findFirst({
      where: {
        url,
        userId,
      },
    });

    if (!website) {
      website = await prismaClient.website.create({
        data: {
          userId,
          url,
        },
      });
    }

    res.json({
      id: website.id,
    });
  }
);

app.get(
  '/api/v1/website/status',
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    const websiteId = req.query.websiteId! as unknown as string;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
      where: {
        id: websiteId,
        userId,
        disabled: false,
      },
      include: {
        ticks: true,
      },
    });

    res.json(data);
  }
);

app.get(
  '/api/v1/websites',
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    const userId = req.userId!;

    const websites = await prismaClient.website.findMany({
      where: {
        userId,
        disabled: false,
      },
      include: {
        ticks: true,
      },
    });

    res.json({
      websites,
    });
  }
);

app.delete(
  '/api/v1/website/',
  authMiddleware,
  async (req: express.Request, res: express.Response) => {
    const websiteId = req.body.websiteId;
    const userId = req.userId!;

    await prismaClient.website.update({
      where: {
        id: websiteId,
        userId,
      },
      data: {
        disabled: true,
      },
    });

    res.json({
      message: 'Deleted website successfully',
    });
  }
);

app.post('/api/v1/payout/:validatorId', async (req, res) => {});

app.listen(8080);
