import { Router } from "express";
import {
    getAllPoojaCategoriesAdmin,
    createPoojaCategory,
    updatePoojaCategory,
    updatePoojaCategoryStatus,
    deletePoojaCategory
} from "../../controllers/admin/poojaCategoryController";
import { authenticate, authorize } from "../../middleware/authMiddleware";

const router = Router();

// Only Admins
router.get("/", authenticate, authorize("ADMIN"), getAllPoojaCategoriesAdmin);
router.post("/", authenticate, authorize("ADMIN"), createPoojaCategory);
router.put("/:id", authenticate, authorize("ADMIN"), updatePoojaCategory);
router.put("/:id/status", authenticate, authorize("ADMIN"), updatePoojaCategoryStatus);
router.delete("/:id", authenticate, authorize("ADMIN"), deletePoojaCategory);

export default router;
