import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { localize } from '../utils/localization';

const JWT_SECRET = process.env.JWT_SECRET || 'devbhakti_secret_key_2026';

const getUserIdFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export const getTempleFilters = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
    
    // We fetch distinct categories and locations from Active Temples
    const temples = await prisma.temple.findMany({
      where: { 
        isActive: true,
        user: { isVerified: true }
      },
      select: { 
        category_en: true, category_hi: true, category_mr: true,
        location_en: true, location_hi: true, location_mr: true 
      }
    });

    const categoriesSet = new Set<string>();
    const locationsSet = new Set<string>();

    temples.forEach(t => {
      const localized = localize(t, lang);
      if (localized.category) categoriesSet.add(localized.category.trim());
      if (localized.location) locationsSet.add(localized.location.trim());
    });

    // We fetch distinct pooja names that are exposed
    const poojas = await prisma.pooja.findMany({
      where: { status: true },
      select: { name_en: true, name_hi: true, name_mr: true }
    });

    const poojasSet = new Set<string>();
    poojas.forEach(p => {
      const localized = localize(p, lang);
      if (localized.name) poojasSet.add(localized.name.trim());
    });

    res.json({
      success: true,
      data: {
        categories: Array.from(categoriesSet).sort(),
        locations: Array.from(locationsSet).sort(),
        poojas: Array.from(poojasSet).sort(),
      }
    });

  } catch (error) {
    console.error('Fetch temple filters error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch filters' });
  }
};

export const getAllTemples = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
    const { search, category, location, pooja, poojaId } = req.query;

    const whereClause: any = {
      isActive: true,
      user: {
        isVerified: true
      }
    };

    if (search) {
      whereClause.OR = [
        { name_en: { contains: String(search), mode: 'insensitive' } },
        { location_en: { contains: String(search), mode: 'insensitive' } },
        { description_en: { contains: String(search), mode: 'insensitive' } },
        { category_en: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'All') {
      whereClause.category_en = String(category);
    }

    if (location && location !== 'All') {
      whereClause.location_en = String(location);
    }

    // Pooja filtering by name
    if (pooja && pooja !== 'All') {
      whereClause.poojas = {
        some: {
          name_en: String(pooja),
          status: true 
        }
      };
    }

    // Pooja filtering by ID (Master or Copy)
    if (poojaId) {
      whereClause.poojas = {
        some: {
          OR: [
            { id: String(poojaId) },
            { masterPoojaId: String(poojaId) }
          ],
          status: true
        }
      };
    }

    let temples = await prisma.temple.findMany({
      where: whereClause,
      include: {
        poojas: {
          where: { status: true }
        }
      },
      take: search ? 50 : undefined 
    });

    // Rank results if searching
    if (search) {
      const lowQuery = String(search).toLowerCase();
      temples.sort((a, b) => {
        const nameA = a.name_en.toLowerCase();
        const nameB = b.name_en.toLowerCase();

        // Exact match priority
        if (nameA === lowQuery && nameB !== lowQuery) return -1;
        if (nameB === lowQuery && nameA !== lowQuery) return 1;

        // Starts with match priority
        if (nameA.startsWith(lowQuery) && !nameB.startsWith(lowQuery)) return -1;
        if (nameB.startsWith(lowQuery) && !nameA.startsWith(lowQuery)) return 1;

        // Name containment priority
        const aInName = nameA.includes(lowQuery);
        const bInName = nameB.includes(lowQuery);
        if (aInName && !bInName) return -1;
        if (bInName && !aInName) return 1;

        return 0;
      });
    }

    let favoritedTempleIds = new Set<string>();

    // If user is logged in, fetch their favorites
    if (userId) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
          templeId: { not: null }
        },
        select: { templeId: true }
      });
      favorites.forEach(fav => {
        if (fav.templeId) favoritedTempleIds.add(fav.templeId);
      });
    }

    // Map temples to include isFavorite AND expose Live URL
    const templesWithDetails = temples.map((temple) => {
      const hasUserLiveFlag = temple.isLive;
      const hasLiveSource = !!(temple.liveUrl || temple.channelId);

      const isLiveNow = !!(hasUserLiveFlag && hasLiveSource);
      const resolvedLiveUrl: string | null = temple.liveUrl || null;

      return {
        ...temple,
        isLiveNow,          // UI ke liye convenience flag
        liveUrl: resolvedLiveUrl, // Hamesha kam se kam user-configured URL
        isFavorite: favoritedTempleIds.has(temple.id)
      };
    });

    res.json({ success: true, data: localize(templesWithDetails, lang) });
  } catch (error) {
    console.error('Fetch temples error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch temples' });
  }
};

export const getTempleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
    const userId = getUserIdFromRequest(req);

    // First, find the temple to get its actual ID
    const temple = await prisma.temple.findFirst({
      where: {
        OR: [
          { id: id as string },
          { slug: id as string },
          { subdomain: id as string }
        ],
        user: {
          isVerified: true,
          role: 'INSTITUTION'
        },
        isActive: true,
      },
      include: {
        user: {
          select: { isVerified: true }
        }
      }
    });

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found or not verified' });
    }

    // Now fetch poojas and events using the actual temple.id
    const [poojas, events] = await Promise.all([
      prisma.pooja.findMany({
        where: {
          templeId: temple.id, // Use actual temple ID
          status: true
        }
      }),
      prisma.event.findMany({
        where: {
          templeId: temple.id,
          status: true
        }
      })
    ]);

    // Resolve live status for this temple using direct URL/flags (no YouTube API)
    const hasUserLiveFlag = temple.isLive;
    const hasLiveSource = !!((temple as any).liveUrl || (temple as any).channelId);
    const isLiveNow = !!(hasUserLiveFlag && hasLiveSource);
    const resolvedLiveUrl: string | null = (temple as any).liveUrl || null;

    let isFavorite = false;
    if (userId) {
      // Note: We must use the resolved temple.id here, not the slug/param
      const fav = await prisma.favorite.findUnique({
        where: {
          userId_templeId: {
            userId: userId,
            templeId: temple.id
          }
        }
      });
      if (fav) isFavorite = true;
    }

    res.json({
      success: true,
      data: localize({
        ...temple,
        poojas,
        events,
        isLiveNow,
        liveUrl: resolvedLiveUrl,
        isFavorite
      }, lang)
    });

  } catch (error) {
    console.error('Fetch temple details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch temple details' });
  }
};


export const registerTemple = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    // This is a dummy endpoint. Real registration happens in temple_admin/templeController.ts
    res.status(201).json({ success: true, message: "Temple registered successfully", data: body });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid temple data' });
  }
};

export const getPoojaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
    const userId = getUserIdFromRequest(req);

    const pooja = await prisma.pooja.findFirst({
      where: {
        id: String(id),
        OR: [
          { isMaster: true },
          {
            temple: {
              user: {
                isVerified: true,
                role: 'INSTITUTION'
              }
            }
          }
        ]
      },
      include: {
        temple: true,
        templeCopies: {
          where: {
            status: true,
            temple: {
              user: { isVerified: true }
            }
          },
          include: {
            temple: {
              select: {
                id: true,
                name_en: true,
                name_hi: true,
                name_mr: true,
                location_en: true,
                location_hi: true,
                location_mr: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!pooja) {
      return res.status(404).json({ success: false, message: 'Pooja not found' });
    }

    let isFavorite = false;
    if (userId) {
      const fav = await prisma.favorite.findUnique({
        where: {
          userId_poojaId: {
            userId: userId,
            poojaId: pooja.id
          }
        }
      });
      if (fav) isFavorite = true;
    }

    res.json({ success: true, data: localize({ ...pooja, isFavorite }, lang) });

  } catch (error) {
    console.error('Get pooja error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pooja' });
  }
};

export const getAllPoojas = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
    const { templeId, category, location, search } = req.query;

    const where: any = {
      status: true
    };

    if (search) {
      where.OR = [
        { name_en: { contains: String(search), mode: 'insensitive' } },
        { category_en: { contains: String(search), mode: 'insensitive' } },
        { about_en: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (templeId) {
      where.templeId = String(templeId);
    } else {
      where.isMaster = true; // Global list only shows Master templates
    }

    if (category && category !== 'All') {
      where.category_en = String(category);
    }

    // Location filtering needs to look at the temple relation or templeCopies
    if (location && location !== 'All') {
      // For master poojas, we might check if any of their templeCopies are in this location
      // or if the pooja itself is associated with a specific temple
      if (templeId) {
        where.temple = { location_en: String(location) };
      } else {
        // For global poojas, we check if they have temple copies in that location
        where.templeCopies = {
          some: {
            temple: { location_en: String(location) },
            status: true
          }
        };
      }
    }

    const poojas = await prisma.pooja.findMany({
      where,
      include: {
        temple: {
          select: {
            name_en: true, name_hi: true, name_mr: true,
            location_en: true, location_hi: true, location_mr: true,
            image: true
          }
        },
        templeCopies: {
          where: { status: true },
          select: { price: true, packages: true }
        },
        _count: {
          select: { templeCopies: true }
        }
      }
    });

    let favoritedPoojaIds = new Set<string>();

    if (userId) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: userId,
          poojaId: { not: null }
        },
        select: { poojaId: true }
      });
      favorites.forEach(fav => {
        if (fav.poojaId) favoritedPoojaIds.add(fav.poojaId);
      });
    }

    const poojasWithFav = poojas.map(pooja => ({
      ...pooja,
      isFavorite: favoritedPoojaIds.has(pooja.id)
    }));

    res.json({ success: true, data: localize(poojasWithFav, lang) });
  } catch (error) {
    console.error('Fetch poojas error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch poojas' });
  }
};
