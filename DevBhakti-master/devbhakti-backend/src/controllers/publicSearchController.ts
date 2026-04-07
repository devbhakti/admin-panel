import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { localize } from "../utils/localization";

export const searchGlobal = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';
        const searchQuery = typeof query === "string" ? query.trim() : "";

        // If no query, prioritize showing Temples by default
        const [temples, poojas, products] = await Promise.all([
            // Search Temples
            prisma.temple.findMany({
                where: (searchQuery ? {
                    OR: [
                        { name_en: { contains: searchQuery, mode: "insensitive" } },
                        { location_en: { contains: searchQuery, mode: "insensitive" } },
                        { category_en: { contains: searchQuery, mode: "insensitive" } },
                        { description_en: { contains: searchQuery, mode: "insensitive" } }
                    ],
                    isActive: true,
                    user: { isVerified: true }
                } : {
                    isActive: true,
                    user: { isVerified: true }
                }) as any,
                select: {
                    id: true,
                    name_en: true, name_hi: true, name_mr: true,
                    location_en: true, location_hi: true, location_mr: true,
                    image: true,
                    category_en: true, category_hi: true, category_mr: true
                } as any,
                take: searchQuery ? 20 : 6, // Fetch more for ranking
                orderBy: { createdAt: "desc" }
            }),

            // Search Poojas (only if searching)
            searchQuery ? prisma.pooja.findMany({
                where: {
                    OR: [
                        { name_en: { contains: searchQuery, mode: "insensitive" } },
                        { category_en: { contains: searchQuery, mode: "insensitive" } },
                        { about_en: { contains: searchQuery, mode: "insensitive" } }
                    ],
                    status: true
                } as any,
                select: {
                    id: true,
                    name_en: true, name_hi: true, name_mr: true,
                    image: true,
                    category_en: true, category_hi: true, category_mr: true,
                    temple: {
                        select: {
                            name_en: true, name_hi: true, name_mr: true
                        }
                    }
                } as any,
                take: 20
            }) : Promise.resolve([]),

            // Search Products (only if searching)
            searchQuery ? prisma.product.findMany({
                where: {
                    OR: [
                        { name_en: { contains: searchQuery, mode: "insensitive" } },
                        { category_en: { contains: searchQuery, mode: "insensitive" } },
                        { description_en: { contains: searchQuery, mode: "insensitive" } }
                    ],
                    status: "approved"
                } as any,
                select: {
                    id: true,
                    name_en: true, name_hi: true, name_mr: true,
                    image: true,
                    category_en: true, category_hi: true, category_mr: true
                } as any,
                take: 20
            }) : Promise.resolve([])
        ]);

        // Localize results
        const locTemples = localize(temples, lang);
        const locPoojas = localize(poojas, lang);
        const locProducts = localize(products, lang);

        // Unify results
        let unifiedResults = [
            ...(locTemples as any[]).map((t: any) => ({
                id: t.id,
                title: t.name,
                category: "Temple" as const,
                location: t.location,
                image: t.image,
                type: t.category
            })),
            ...(locPoojas as any[]).map(p => ({
                id: p.id,
                title: p.name,
                category: "Pooja" as const,
                location: p.temple?.name,
                image: p.image,
                type: p.category
            })),
            ...(locProducts as any[]).map(p => ({
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
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();

                // Exact match priority (case-insensitive)
                if (titleA === lowQuery && titleB !== lowQuery) return -1;
                if (titleB === lowQuery && titleA !== lowQuery) return 1;

                // Starts with match priority
                if (titleA.startsWith(lowQuery) && !titleB.startsWith(lowQuery)) return -1;
                if (titleB.startsWith(lowQuery) && !titleA.startsWith(lowQuery)) return 1;

                // Title containment priority
                const aInTitle = titleA.includes(lowQuery);
                const bInTitle = titleB.includes(lowQuery);
                if (aInTitle && !bInTitle) return -1;
                if (bInTitle && !aInTitle) return 1;

                return 0; // Keep original order (usually createdAt) for other matches
            });

            // After ranking, take the top 12 or 15
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
