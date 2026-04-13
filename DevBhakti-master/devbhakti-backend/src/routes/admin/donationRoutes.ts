import { Router } from "express";
import { getAllDonations, getDonationStats, deleteDonation, downloadDonationsExcel, sendDonationEmail } from "../../controllers/admin/donationController";

const router = Router();

router.get("/", getAllDonations);
router.get("/stats", getDonationStats);
router.delete("/:id", deleteDonation);
router.get("/export/excel", downloadDonationsExcel);
router.post("/send-email/:id", sendDonationEmail);
export default router;
