import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { localize, getLang } from "../utils/localization";

export const searchGlobal = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const lang = getLang(req);
        const searchQuery = typeof query === "string" ? query.trim() : "";

        const [temples, poojas, products] = await Promise.all([
            // Search Temples — JSON path query
            prisma.temple.findMany({
                where: (searchQuery ? {
                    OR: [
                        { name: { path: ['en'], string_contains: searchQuery } },
                        { name: { path: ['hi'], string_contains: searchQuery } },
                        { location: { path: ['en'], string_contains: searchQuery } },
                        { category: { path: ['en'], string_contains: searchQuery } },
                    ],
                    isActive: true,
                    user: { isVerified: true }
                } : {
                    isActive: true,
                    user: { isVerified: true }
                }) as any,
                select: {
                    id: true,
                    name: true,
                    location: true,
                    image: true,
                    category: true
                },
                take: searchQuery ? 20 : 6,
                orderBy: { createdAt: "desc" }
            }),

            // Search Poojas
            searchQuery ? prisma.pooja.findMany({
                where: {
                    OR: [
                        { name: { path: ['en'], string_contains: searchQuery } },
                        { name: { path: ['hi'], string_contains: searchQuery } },
                        { category: { path: ['en'], string_contains: searchQuery } },
                        { about: { path: ['en'], string_contains: searchQuery } }
                    ],
                    status: true
                } as any,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    category: true,
                    isMaster: true,
                    masterPoojaId: true,
                    temple: {
                        select: { name: true }
                    }
                },
                take: 20
            }) : Promise.resolve([]),

            // Search Products
            searchQuery ? prisma.product.findMany({
                where: {
                    OR: [
                        { name: { path: ['en'], string_contains: searchQuery } },
                        { name: { path: ['hi'], string_contains: searchQuery } },
                        { category: { path: ['en'], string_contains: searchQuery } },
                        { description: { path: ['en'], string_contains: searchQuery } }
                    ],
                    status: "approved"
                } as any,
                select: {
                    id: true,
                    name: true,
                    image: true,
                    category: true
                },
                take: 20
            }) : Promise.resolve([])
        ]);

        // Localize results — JSON fields → selected lang
        const locTemples = localize(temples, lang);
        const locPoojas = localize(poojas, lang);
        const locProducts = localize(products, lang);

        // Deduplicate Poojas by name, preferring Master poojas
        const uniquePoojasMap = new Map();
        (locPoojas as any[]).forEach((p: any) => {
            const key = (p.name || '').toLowerCase().trim();
            if (!key) return;
            const existing = uniquePoojasMap.get(key);
            const isBetter = !existing || 
                             (p.isMaster && !existing.isMaster) || 
                             (!p.masterPoojaId && existing.masterPoojaId && !p.isMaster);
            if (isBetter) {
                uniquePoojasMap.set(key, p);
            }
        });
        const deduplicatedPoojas = Array.from(uniquePoojasMap.values());

        let unifiedResults = [
            ...(locTemples as any[]).map((t: any) => ({
                id: t.id,
                title: t.name,
                category: "Temple" as const,
                location: t.location,
                image: t.image,
                type: t.category
            })),
            ...(deduplicatedPoojas as any[]).map((p: any) => ({
                id: p.id,
                title: p.name,
                category: "Pooja" as const,
                location: p.temple?.name,
                image: p.image,
                type: p.category
            })),
            ...(locProducts as any[]).map((p: any) => ({
                id: p.id,
                title: p.name,
                category: "Product" as const,
                image: p.image,
                type: p.category
            }))
        ];

        // Rank results if searching
        if (searchQuery) {
            const lowQuery = searchQuery.toLowerCase();
            unifiedResults.sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                if (titleA === lowQuery && titleB !== lowQuery) return -1;
                if (titleB === lowQuery && titleA !== lowQuery) return 1;
                if (titleA.startsWith(lowQuery) && !titleB.startsWith(lowQuery)) return -1;
                if (titleB.startsWith(lowQuery) && !titleA.startsWith(lowQuery)) return 1;
                if (titleA.includes(lowQuery) && !titleB.includes(lowQuery)) return -1;
                if (titleB.includes(lowQuery) && !titleA.includes(lowQuery)) return 1;
                return 0;
            });
            unifiedResults = unifiedResults.slice(0, 15);
        }

        res.status(200).json({
            success: true,
            data: unifiedResults,
            isDefault: !searchQuery
        });

    } catch (error) {
        console.error("Global Search Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
