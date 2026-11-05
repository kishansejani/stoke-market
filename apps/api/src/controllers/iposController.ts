import { Request, Response } from 'express';
import { prisma } from '../models/prisma.js';

export async function getIPOs(req: Request, res: Response): Promise<void> {
  try {
    const marketId = (req.query.marketId as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const q = (req.query.q as string)?.trim();

    const where: any = {};
    if (marketId && marketId !== 'ALL') {
      where.marketId = marketId.toUpperCase();
    }
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }
    if (category) {
      where.category = category.toUpperCase();
    }
    if (q) {
      where.OR = [
        { companyName: { contains: q, mode: 'insensitive' } },
        { symbol: { contains: q, mode: 'insensitive' } },
      ];
    }

    const ipos = await prisma.iPO.findMany({
      where,
      orderBy: [
        { openDate: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: ipos,
      total: ipos.length,
    });
  } catch (error: any) {
    console.error('Error fetching IPOs:', error);
    res.status(500).json({
      success: false,
      error: { code: 'IPO_FETCH_FAILED', message: error.message },
    });
  }
}

export async function getIPOById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const ipo = await prisma.iPO.findUnique({
      where: { id },
    });

    if (!ipo) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'IPO offering not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: ipo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'IPO_FETCH_FAILED', message: error.message },
    });
  }
}
