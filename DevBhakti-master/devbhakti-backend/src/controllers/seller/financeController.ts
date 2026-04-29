import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { isPayoutAllowed, nextPayoutDate } from "../../utils/payoutSchedule";

// Get Ledger Entries for a Seller
export const getSellerLedger = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;

        if (!sellerId) {
            return res.status(404).json({ success: false, message: "Seller store not found" });
        }

        const entries = await prisma.templeLedger.findMany({
            where: { sellerId },
            orderBy: { createdAt: "desc" }
        });

        // Enriched response mapping
        let enrichedEntries = entries;
        
        try {
            const marketplaceEntries = entries.filter(e => e.type === "MARKETPLACE_EARNING" && e.sourceId);
            const orderIds = Array.from(new Set(marketplaceEntries.map(e => e.sourceId as string)));

            if (orderIds.length > 0) {
                const orders = await prisma.order.findMany({
                    where: { id: { in: orderIds } },
                    include: {
                        user: { select: { name: true } },
                        subOrders: {
                            where: { sellerId: sellerId }
                        }
                    }
                });

                const orderMap = new Map(orders.map(o => [o.id, o]));

                enrichedEntries = entries.map(entry => {
                    try {
                        if (entry.type === "MARKETPLACE_EARNING" && entry.sourceId) {
                            const order = orderMap.get(entry.sourceId);
                            if (order) {
                                const subOrder = order.subOrders[0]; // Filtered by sellerId in the query
                                return {
                                    ...entry,
                                    orderDetail: {
                                        displayId: order.displayId || "N/A",
                                        customerName: order.user?.name || "N/A",
                                        paymentStatus: order.paymentStatus || "PENDING",
                                        deliveryStatus: subOrder?.status || "PENDING"
                                    }
                                };
                            }
                        }
                    } catch (mapErr) {
                        console.error("Map iteration error:", mapErr);
                    }
                    return entry;
                });
            }
        } catch (enrichErr) {
            console.error("Enrichment logic failed:", enrichErr);
            // Fallback to raw entries
            enrichedEntries = entries;
        }

        return res.status(200).json({ success: true, data: enrichedEntries });
    } catch (error: any) {
        console.error("Seller Ledger API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get Financial Summary for Seller Dashboard
export const getSellerFinanceSummary = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;

        if (!sellerId) {
            return res.status(404).json({ success: false, message: "Seller store not found" });
        }

        const [ledger, withdrawals] = await Promise.all([
            prisma.templeLedger.findMany({ where: { sellerId } }),
            prisma.withdrawalRequest.findMany({
                where: { sellerId, status: { in: ["PENDING", "APPROVED", "PAID"] } }
            })
        ]);

        const now = new Date();
        const escrowThreshold = new Date(now.getTime());

        const validIncomeEntries = ledger.filter((e: any) =>
            e.type !== "WITHDRAWAL" && e.status !== "CANCELLED"
        );

        const totalEarnings = validIncomeEntries.reduce((sum: number, e: any) => sum + (e.grossAmount || 0), 0);
        const totalCommission = validIncomeEntries.reduce((sum: number, e: any) => sum + (e.commission || 0), 0);
        const netEarnings = totalEarnings - totalCommission;

        const completedIncomeEntries = validIncomeEntries.filter((e: any) => e.status === "COMPLETED");

        const settledIncome = completedIncomeEntries
            .filter((e: any) => new Date(e.createdAt) <= escrowThreshold)
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        const inEscrow = completedIncomeEntries
            .filter((e: any) => new Date(e.createdAt) > escrowThreshold)
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        const pendingFulfillment = validIncomeEntries
            .filter((e: any) => e.status === "PENDING")
            .reduce((sum: number, e: any) => sum + e.amount, 0);

        const totalPaidPayouts = withdrawals
            .filter((w: any) => w.status === "PAID")
            .reduce((sum: number, w: any) => sum + w.amount, 0);

        const processingWithdrawals = withdrawals
            .filter((w: any) => w.status === "PENDING" || w.status === "APPROVED")
            .reduce((sum: number, w: any) => sum + w.amount, 0);

        let finalAvailable = settledIncome - totalPaidPayouts - processingWithdrawals;

        if (!isPayoutAllowed(now)) {
            finalAvailable = 0;
        }

        const pendingOrdersCount = validIncomeEntries.filter((e: any) => e.status === "PENDING").length;

        const revenueHistory = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dateStr = d.toISOString().split('T')[0];
            const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            const dailySum = validIncomeEntries
                .filter((e: any) => new Date(e.createdAt).toISOString().split('T')[0] === dateStr)
                .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

            revenueHistory.push({ date: dateStr, name: displayDate, revenue: dailySum });
        }

        return res.status(200).json({
            success: true,
            data: {
                totalEarnings,
                totalCommission,
                netEarnings,
                availableBalance: Math.max(0, finalAvailable),
                pendingBalance: pendingFulfillment,
                activeOrdersCount: pendingOrdersCount,
                inEscrow,
                processingWithdrawals,
                revenueHistory
            }
        });

    } catch (error: any) {
        console.error("Seller Finance Summary Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load financial summary" });
    }
};

// Request Withdrawal
export const requestSellerWithdrawal = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;
        const { amount, bankDetails } = req.body;

        if (!sellerId) {
            return res.status(404).json({ success: false, message: "Seller store not found" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        await prisma.$transaction(async (tx) => {
            const now = new Date();
            if (!isPayoutAllowed(now)) {
                const next = nextPayoutDate(now);
                throw new Error(`Payouts are only processed on the 15th and 28th. Next allowed date: ${next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
            }

            const escrowThreshold = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

            const ledger = await tx.templeLedger.findMany({
                where: {
                    sellerId,
                    status: "COMPLETED",
                    type: { not: "WITHDRAWAL" },
                    createdAt: { lte: escrowThreshold }
                }
            });

            const settledIncome = ledger.reduce((sum: number, e: any) => sum + e.amount, 0);

            const withdrawals = await tx.withdrawalRequest.findMany({
                where: { sellerId, status: { in: ["PENDING", "APPROVED", "PAID"] } }
            });

            const totalDebits = withdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
            const netAvailable = settledIncome - totalDebits;

            if (amount > netAvailable) {
                throw new Error(`Insufficient settled balance. Available: ₹${netAvailable}`);
            }

            await tx.withdrawalRequest.create({
                data: {
                    sellerId,
                    amount,
                    bankDetails,
                    status: "PENDING"
                }
            });
        });

        return res.status(201).json({ success: true, message: "Withdrawal request submitted successfully" });

    } catch (error: any) {
        console.error("Seller Withdrawal Request Error:", error);
        const statusCode = error.message.includes("Insufficient") ? 400 : 500;
        return res.status(statusCode).json({ success: false, message: error.message });
    }
};

// Get Withdrawal History
export const getSellerWithdrawals = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;

        if (!sellerId) {
            return res.status(404).json({ success: false, message: "Seller store not found" });
        }

        const withdrawals = await prisma.withdrawalRequest.findMany({
            where: { sellerId },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json({ success: true, data: withdrawals });
    } catch (error: any) {
        console.error("Seller Withdrawal History Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load withdrawal history" });
    }
};
