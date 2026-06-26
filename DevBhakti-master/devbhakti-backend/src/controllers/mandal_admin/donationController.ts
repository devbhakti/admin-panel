import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { getLang, localize } from "../../utils/localization";

export const getMandalDonations = async (req: Request, res: Response) => {
    try {
        const mandalId = (req as any).owner.ownerId;
        const { search, status, page = 1, limit = 10, startDate, endDate } = req.query;
        const skip = (parseInt(String(page), 10) - 1) * parseInt(String(limit), 10);

        const where: any = { mandalId };

        if (status && status !== "all") {
            where.status = status;
        } else if (!status || status === "all") {
            where.status = "SUCCESS";
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(String(startDate));
            }
            if (endDate) {
                const end = new Date(String(endDate));
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        if (search) {
            where.OR = [
                { id: { contains: String(search), mode: 'insensitive' } },
                { donorName: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const [donations, total] = await Promise.all([
            prisma.donation.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(String(limit), 10)
            }),
            prisma.donation.count({ where })
        ]);

        const lang = getLang(req);
        res.status(200).json({
            success: true,
            data: localize(donations, lang),
            pagination: {
                total,
                page: parseInt(String(page), 10),
                limit: parseInt(String(limit), 10),
                totalPages: Math.ceil(total / parseInt(String(limit), 10))
            }
        });
    } catch (error: any) {
        console.error("Get Mandal Donations Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMandalDonationStats = async (req: Request, res: Response) => {
    try {
        const mandalId = (req as any).owner.ownerId;

        const stats = await prisma.donation.groupBy({
            by: ['status'],
            where: { mandalId },
            _sum: { amount: true },
            _count: { id: true }
        });

        const result = {
            totalAmount: 0,
            successCount: 0,
            pendingCount: 0,
            failedCount: 0,
            totalDonors: 0
        };

        const uniqueDonors = await prisma.donation.groupBy({
            by: ['donorName'],
            where: { mandalId, status: 'SUCCESS' }
        });
        result.totalDonors = uniqueDonors.length;

        stats.forEach((s: any) => {
            if (s.status === "SUCCESS") {
                result.totalAmount = s._sum.amount || 0;
                result.successCount = s._count.id;
            } else if (s.status === "PENDING") {
                result.pendingCount = s._count.id;
            } else if (s.status === "FAILED") {
                result.failedCount = s._count.id;
            }
        });

        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        console.error("Get Mandal Donation Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
