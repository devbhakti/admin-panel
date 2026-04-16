import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { syncOrderAndLedgerStatus, mapShiprocketStatus } from "../utils/orderStatusSync";

const prisma = new PrismaClient();

export const shiprocketWebhook = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        console.log("Shiprocket Webhook Received:", JSON.stringify(data));

        const {
            order_id,
            status: srStatus,
            awb,
            tracking_url,
            courier_name
        } = data;

        if (order_id) {
            // Find sub-order by shiprocketOrderId
            const subOrder = await prisma.subOrder.findFirst({
                where: { shiprocketOrderId: order_id.toString() }
            });

            if (subOrder) {
                const internalStatus = mapShiprocketStatus(srStatus);

                // Update common tracking fields
                await prisma.subOrder.update({
                    where: { id: subOrder.id },
                    data: {
                        awbCode: awb || subOrder.awbCode,
                        trackingUrl: tracking_url || subOrder.trackingUrl,
                        courierName: courier_name || subOrder.courierName
                    }
                });

                // Use shared utility for status sync (Ledger, Parent Order, etc.)
                await syncOrderAndLedgerStatus(subOrder.id, internalStatus);

                console.log(`Updated SubOrder ${subOrder.id} status to ${internalStatus} (from SR: ${srStatus})`);

                if (internalStatus === "SHIPPED" || internalStatus === "DELIVERED") {
                    try {
                        const { notifyUser } = require("../services/firebaseService");
                        const parentOrder = await prisma.order.findUnique({ where: { id: subOrder.orderId } });
                        if (parentOrder) {
                            await notifyUser(parentOrder.userId, 'devotee', {
                                title: JSON.stringify({
                                    en: `Order ${internalStatus}! 📦`,
                                    hi: `ऑर्डर ${internalStatus === 'SHIPPED' ? 'डिस्पैच हो गया' : 'डिलीवर हो गया'}! 📦`,
                                    mr: `ऑर्डर ${internalStatus === 'SHIPPED' ? 'डिस्पॅच झाला' : 'वितरीत झाला'}! 📦`
                                }),
                                body: JSON.stringify({
                                    en: `Your order update: sub-order is now ${internalStatus}. ${tracking_url ? `Track it here: ${tracking_url}` : ''}`,
                                    hi: `आपका ऑर्डर अपडेट: ऑर्डर ${internalStatus === 'SHIPPED' ? 'डिस्पैच हो गया है' : 'डिलीवर कर दिया गया है'}। ${tracking_url ? `यहाँ ट्रैक करें: ${tracking_url}` : ''}`,
                                    mr: `तुमची ऑर्डर अपडेट: ऑर्डर ${internalStatus === 'SHIPPED' ? 'डिस्पॅच झाली आहे' : 'वितरीत केली आहे'}. ${tracking_url ? `येथे ट्रॅक करा: ${tracking_url}` : ''}`
                                }),
                                data: {
                                    link: `/profile/orders`,
                                    type: `ORDER_${internalStatus}`,
                                    orderId: parentOrder.id
                                }
                            });
                        }
                    } catch (notifyErr) {
                        console.error("Failed to send order status push notification:", notifyErr);
                    }
                }
            }
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Shiprocket Webhook Error:", error.message);
        return res.status(500).json({ success: false });
    }
};
