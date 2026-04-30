import { Router, Request, Response } from "express";
import { getApprovedPoojaCategories, createPoojaCategory } from "../controllers/admin/poojaCategoryController";
import { authenticate, injectTempleContext } from "../middleware/authMiddleware";

const router = Router();

// Public: Get all approved categories
router.get("/", getApprovedPoojaCategories);

// Temple Admin (or anyone authorized): Suggest a category
router.post("/suggest", authenticate, injectTempleContext, (req: any, res: any) => {
    req.body.status = "PENDING";
    // We pass the templeId from the injected context
    req.body.templeId = req.owner?.ownerId;
    return createPoojaCategory(req, res);
});

export default router;
