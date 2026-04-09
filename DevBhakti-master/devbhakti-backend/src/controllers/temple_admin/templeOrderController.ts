import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { syncOrderAndLedgerStatus } from "../../utils/orderStatusSync";
import { getLang, localize } from "../../utils/localization";

// Get orders specifically for a Temple
export const getTempleOrders = async (req: Request, res: Response) => {
  try {
    const templeId = req.params.templeId as string;

    const subOrders = await prisma.subOrder.findMany({
      where: { templeId },
      include: {
        order: {
          include: {
            user: { select: { name: true, phone: true } }
          }
        },
        items: {
          include: {
            product: { select: { name: true, image: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const lang = getLang(req);
    const localizedSubOrders = localize(subOrders, lang);

    const formattedSubOrders = localizedSubOrders.map((sub: any) => {
      return {
        ...sub,
        totalAmount: sub.totalAmount ? Number(sub.totalAmount).toFixed(2) : "0.00",
        order: sub.order ? {
          ...sub.order,
          totalAmount: sub.order.totalAmount ? Number(sub.order.totalAmount).toFixed(2) : "0.00"
        } : sub.order
      };
    });

    return res.status(200).json({ success: true, data: formattedSubOrders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Temple updates their own sub-order status
export const updateTempleOrderStatus = async (req: Request, res: Response) => {
  try {
    const subOrderId = req.params.subOrderId as string;
    const { status, shippingLabel, templeId } = req.body;

    // Verify this sub-order belongs to the temple
    const existing = await prisma.subOrder.findUnique({
      where: { id: subOrderId }
    });

    if (!existing || existing.templeId !== templeId) {
      return res.status(403).json({ success: false, message: "Unauthorized or order not found" });
    }

    // Optional: Update shippingLabel if provided
    if (shippingLabel) {
      await prisma.subOrder.update({
        where: { id: subOrderId },
        data: { shippingLabel }
      });
    }

    // Use shared utility for status sync (Ledger, Parent Order, etc.)
    const updated = await syncOrderAndLedgerStatus(subOrderId, status);

    const lang = getLang(req);
    return res.status(200).json({ success: true, message: "Order status updated", data: localize(updated, lang) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
