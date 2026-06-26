import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isPayoutAllowed, nextPayoutDate } from "../../utils/payoutSchedule";

const prisma = new PrismaClient();

// Get Ledger Entries for a Mandal
export const getMandalLedger = async (req: Request, res: Response) => {
  try {
    const mandalId = (req as any).owner.ownerId;

    const entries = await prisma.mandalLedger.findMany({
      where: { mandalId },
      orderBy: { createdAt: "desc" }
    });

    let enrichedEntries = entries;
    try {
      const sourceIds = entries.filter(e => e.sourceId).map(e => e.sourceId as string);
      
      if (sourceIds.length > 0) {
        // Fetch donations in parallel
        const donations = await prisma.donation.findMany({
          where: { id: { in: sourceIds } },
          include: { user: { select: { name: true } } }
        });

        const donationMap = new Map(donations.map(d => [d.id, d]));

        enrichedEntries = entries.map(entry => {
          if (entry.sourceId) {
            if (entry.type === "DONATION_EARNING") {
              const donation = donationMap.get(entry.sourceId);
              if (donation) {
                return {
                  ...entry,
                  orderDetail: {
                    displayId: donation.id.slice(-8).toUpperCase(),
                    customerName: donation.user?.name || donation.donorName || "Anonymous",
                    paymentStatus: "PAID",
                    deliveryStatus: "COMPLETED"
                  }
                };
              }
            }
          }
          return entry;
        });
      }
    } catch (enrichErr) {
      console.error("Mandal ledger enrichment failed:", enrichErr);
    }

    return res.status(200).json({ success: true, data: enrichedEntries });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Financial Summary for Mandal Dashboard
export const getMandalFinanceSummary = async (req: Request, res: Response) => {
  try {
    const mandalId = (req as any).owner.ownerId;

    // Fetch data in parallel
    const [ledger, withdrawals] = await Promise.all([
      prisma.mandalLedger.findMany({ where: { mandalId } }),
      prisma.mandalWithdrawalRequest.findMany({
        where: { mandalId, status: { in: ["PENDING", "APPROVED", "PAID"] } }
      })
    ]);

    const now = new Date();
    const escrowThreshold = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    // Filter valid income (exclude withdrawals and cancelled txns)
    const validIncomeEntries = ledger.filter((e: any) =>
      e.type !== "WITHDRAWAL" && e.status !== "CANCELLED"
    );

    const totalEarnings = validIncomeEntries.reduce((sum: number, e: any) => sum + (e.grossAmount || 0), 0);
    const totalCommission = validIncomeEntries.reduce((sum: number, e: any) => sum + (e.commission || 0), 0);
    const netEarnings = totalEarnings - totalCommission;

    const completedIncomeEntries = validIncomeEntries.filter((e: any) => e.status === "COMPLETED");

    // Settled: Completed AND older than 3 days
    const settledIncome = completedIncomeEntries
      .filter((e: any) => new Date(e.createdAt) <= escrowThreshold)
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    // In Escrow: Completed BUT newer than 3 days
    const inEscrow = completedIncomeEntries
      .filter((e: any) => new Date(e.createdAt) > escrowThreshold)
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    // Pending Fulfillment: Not even completed yet
    const pendingFulfillment = validIncomeEntries
      .filter((e: any) => e.status === "PENDING")
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    // Paid Withdrawals
    const totalPaidPayouts = withdrawals
      .filter((w: any) => w.status === "PAID")
      .reduce((sum: number, w: any) => sum + w.amount, 0);

    // Locked/Processing
    const processingWithdrawals = withdrawals
      .filter((w: any) => w.status === "PENDING" || w.status === "APPROVED")
      .reduce((sum: number, w: any) => sum + w.amount, 0);

    // Available balance
    let finalAvailable = settledIncome - totalPaidPayouts - processingWithdrawals;
    if (!isPayoutAllowed(now)) {
      finalAvailable = 0;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalCommission,
        netEarnings,
        availableBalance: Math.max(0, finalAvailable),
        pendingBalance: pendingFulfillment,
        inEscrow,
        processingWithdrawals
      }
    });

  } catch (error: any) {
    console.error("Mandal Finance Summary Error:", error);
    return res.status(500).json({ success: false, message: "Failed to load financial summary" });
  }
};

// Request Withdrawal
export const requestMandalWithdrawal = async (req: Request, res: Response) => {
  try {
    const mandalId = (req as any).owner.ownerId;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    await prisma.$transaction(async (tx) => {
      const now = new Date();

      if (!isPayoutAllowed(now)) {
        const next = nextPayoutDate(now);
        throw new Error(`Payouts are only allowed on the 15th and 28th. Next payout date: ${next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`);
      }

      const escrowThreshold = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      const ledger = await tx.mandalLedger.findMany({
        where: {
          mandalId,
          status: "COMPLETED",
          type: { not: "WITHDRAWAL" },
          createdAt: { lte: escrowThreshold }
        }
      });

      const settledIncome = ledger.reduce((sum: number, e: any) => sum + e.amount, 0);

      const withdrawals = await tx.mandalWithdrawalRequest.findMany({
        where: { mandalId, status: { in: ["PENDING", "APPROVED", "PAID"] } }
      });

      const totalDebits = withdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);
      const netAvailable = settledIncome - totalDebits;

      if (amount > netAvailable) {
        throw new Error(`Insufficient settled balance. Available: ₹${netAvailable}`);
      }

      await tx.mandalWithdrawalRequest.create({
        data: {
          mandalId,
          amount,
          bankDetails,
          status: "PENDING"
        }
      });
    });

    try {
        const { notifyAdmins } = require("../../services/firebaseService");
        await notifyAdmins({
            title: 'New Mandal Withdrawal Request 🏛️',
            body: `A mandal has requested a withdrawal of ₹${amount}.`,
            data: {
                link: '/admin/finance',
                type: 'MANDAL_WITHDRAWAL_REQUEST'
            }
        });
    } catch (notifyErr) {
        console.error("Failed to notify admins for withdrawal:", notifyErr);
    }

    return res.status(201).json({ success: true, message: "Withdrawal request submitted successfully" });

  } catch (error: any) {
    console.error("Withdrawal Request Error:", error);
    const statusCode = error.message.includes("Insufficient") ? 400 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};
