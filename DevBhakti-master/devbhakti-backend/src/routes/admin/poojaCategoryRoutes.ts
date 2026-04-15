import { Router } from "express";
import {
    getAllPoojaCategoriesAdmin,
    createPoojaCategory,
    updatePoojaCategory,
    updatePoojaCategoryStatus,
    deletePoojaCategory
} from "../../controllers/admin/poojaCategoryController";
import { authenticate, authorize, checkPermission } from "../../middleware/authMiddleware";

const router = Router();

// Only authorized staff or admins
router.get("/", authenticate, checkPermission("poojas.categories", "poojas.view", "poojas.create", "poojas.edit"), getAllPoojaCategoriesAdmin);
router.post("/", authenticate, checkPermission("poojas.categories"), createPoojaCategory);
router.put("/:id", authenticate, checkPermission("poojas.categories"), updatePoojaCategory);
router.put("/:id/status", authenticate, checkPermission("poojas.categories"), updatePoojaCategoryStatus);
router.delete("/:id", authenticate, checkPermission("poojas.categories"), deletePoojaCategory);

export default router;
