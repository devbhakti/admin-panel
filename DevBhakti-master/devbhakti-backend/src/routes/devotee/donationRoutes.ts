import { Router } from "express";
import { initiateDonation, getDonationReceipt, getMyDonations, calculateDonationCommission } from "../../controllers/devotee/donationController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/calculate-fee", calculateDonationCommission);
router.post("/", initiateDonation);

// Protected routes
router.use(authenticate);
router.get("/my", getMyDonations);
router.get("/:id/receipt", getDonationReceipt);

export default router;
