import { Router } from "express";
import {
    getTempleDonations,
    getTempleDonationStats,
    downloadDonationsExcel,
    downloadDonationsPdf,
    createTempleDonation,
    sendTempleDonationEmail,
} from "../../controllers/temple_admin/templeDonationController";

const router = Router();

router.post("/send-email/:id", sendTempleDonationEmail);
router.post("/:templeId", createTempleDonation);
router.get("/:templeId/export/excel", downloadDonationsExcel);
router.get("/:templeId/export/pdf", downloadDonationsPdf);
router.get("/:templeId", getTempleDonations);
router.get("/:templeId/stats", getTempleDonationStats);

export default router;
