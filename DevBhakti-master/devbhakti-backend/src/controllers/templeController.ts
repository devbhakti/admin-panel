import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { localize, getEnglish, getLang } from '../utils/localization';

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

// getLang is now imported from ../utils/localization

export const getTempleFilters = async (req: Request, res: Response) => {
  try {
    const lang = getLang(req);

    // Fetch distinct categories and locations from Active Temples
    const temples = await prisma.temple.findMany({
      where: {
        isActive: true,
        user: { isVerified: true }
      },
      select: {
        category: true,
        location: true
      }
    });

    const categoriesSet = new Set<string>();
    const locationsSet = new Set<string>();

    temples.forEach(t => {
      // category & location are now Json — pick selected lang
      const cat = t.category as any;
      const loc = t.location as any;
      if (cat) {
        const val = (cat[lang] || cat['en'] || '').trim();
        if (val) categoriesSet.add(val);
      }
      if (loc) {
        const val = (loc[lang] || loc['en'] || '').trim();
        if (val) locationsSet.add(val);
      }
    });

    // Fetch distinct pooja names
    const poojas = await prisma.pooja.findMany({
      where: { status: true },
      select: { name: true }
    });

    const poojasSet = new Set<string>();
    poojas.forEach(p => {
      const name = p.name as any;
      if (name) {
        const val = (name[lang] || name['en'] || '').trim();
        if (val) poojasSet.add(val);
      }
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
    const lang = getLang(req);
    const { search, category, location, pooja, poojaId } = req.query;

    const whereClause: any = {
      isActive: true,
      user: { isVerified: true }
    };

    // Search: JSON fields use path query in PostgreSQL
    if (search) {
      whereClause.OR = [
        { name: { path: ['en'], string_contains: String(search) } },
        { name: { path: ['hi'], string_contains: String(search) } },
        { location: { path: ['en'], string_contains: String(search) } },
      ];
    }

    // Category filter — match English value (stored in JSON)
    if (category && category !== 'All') {
      whereClause.category = { path: ['en'], equals: String(category) };
    }

    // Location filter — match English value
    if (location && location !== 'All') {
      whereClause.location = { path: ['en'], string_contains: String(location) };
    }

    // Pooja filtering by name (English)
    if (pooja && pooja !== 'All') {
      whereClause.poojas = {
        some: {
          name: { path: ['en'], equals: String(pooja) },
          status: true
        }
      };
    }

    // Pooja filtering by ID
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

    // Rank results if searching — compare English name
    if (search) {
      const lowQuery = String(search).toLowerCase();
      temples.sort((a, b) => {
        const nameA = getEnglish(a.name).toLowerCase();
        const nameB = getEnglish(b.name).toLowerCase();

        if (nameA === lowQuery && nameB !== lowQuery) return -1;
        if (nameB === lowQuery && nameA !== lowQuery) return 1;
        if (nameA.startsWith(lowQuery) && !nameB.startsWith(lowQuery)) return -1;
        if (nameB.startsWith(lowQuery) && !nameA.startsWith(lowQuery)) return 1;
        const aInName = nameA.includes(lowQuery);
        const bInName = nameB.includes(lowQuery);
        if (aInName && !bInName) return -1;
        if (bInName && !aInName) return 1;

        return 0;
      });
    }

    let favoritedTempleIds = new Set<string>();

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

    const templesWithDetails = temples.map((temple) => {
      const hasUserLiveFlag = temple.isLive;
      const hasLiveSource = !!(temple.liveUrl || temple.channelId);
      const isLiveNow = !!(hasUserLiveFlag && hasLiveSource);
      const resolvedLiveUrl: string | null = temple.liveUrl || null;

      return {
        ...temple,
        isLiveNow,
        liveUrl: resolvedLiveUrl,
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
    const lang = getLang(req);
    const userId = getUserIdFromRequest(req);

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

    const [poojas, events] = await Promise.all([
      prisma.pooja.findMany({
        where: {
          templeId: temple.id,
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

    const hasUserLiveFlag = temple.isLive;
    const hasLiveSource = !!((temple as any).liveUrl || (temple as any).channelId);
    const isLiveNow = !!(hasUserLiveFlag && hasLiveSource);
    const resolvedLiveUrl: string | null = (temple as any).liveUrl || null;

    let isFavorite = false;
    if (userId) {
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
    res.status(201).json({ success: true, message: "Temple registered successfully", data: body });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid temple data' });
  }
};

export const getPoojaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lang = getLang(req);
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
                name: true,       // Json field — localize() will handle
                location: true,   // Json field — localize() will handle
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
    const lang = getLang(req);
    const { templeId, category, location, search } = req.query;

    const where: any = {
      status: true
    };

    if (search) {
      where.OR = [
        { name: { path: ['en'], string_contains: String(search) } },
        { name: { path: ['hi'], string_contains: String(search) } },
        { about: { path: ['en'], string_contains: String(search) } },
      ];
    }

    if (templeId) {
      where.templeId = String(templeId);
    } else {
      where.isMaster = true;
    }

    if (category && category !== 'All') {
      where.category = { path: ['en'], equals: String(category) };
    }

    if (location && location !== 'All') {
      if (templeId) {
        where.temple = { location: { path: ['en'], string_contains: String(location) } };
      } else {
        where.templeCopies = {
          some: {
            temple: { location: { path: ['en'], string_contains: String(location) } },
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
            name: true,       // Json — localize() handles
            location: true,   // Json — localize() handles
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
