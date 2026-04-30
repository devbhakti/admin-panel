import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { buildLangJson, getLang, localize } from "../../utils/localization";

// Get All Pooja Categories (Admin)
export const getAllPoojaCategoriesAdmin = async (req: Request, res: Response) => {
    try {
        const { status, search } = req.query;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.name = { path: ['en'], string_contains: search as string };
        }

        const categories = await prisma.poojaCategory.findMany({
            where: where,
            include: {
                temple: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Return raw data for admin so all language fields are available for editing
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        console.error("Get All Pooja Categories Admin Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create or Sugest Pooja Category
export const createPoojaCategory = async (req: Request, res: Response) => {
    try {
        const { name_en, name_hi, name_mr, status = "APPROVED" } = req.body;

        const final_name_en = (name_en || req.body.name || "").trim();

        if (!final_name_en) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        // We use the English name as a slug for uniqueness checks
        const nameSlug = final_name_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const existing = await prisma.poojaCategory.findUnique({
            where: { nameSlug }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await prisma.poojaCategory.create({
            data: {
                name: buildLangJson(final_name_en, name_hi, name_mr),
                nameSlug,
                status,
                ...(req.body.templeId ? { templeId: req.body.templeId } : {})
            }
        });

        res.status(201).json({
            success: true,
            message: status === "PENDING" ? "Category suggested successfully" : "Category created successfully",
            data: category
        });
    } catch (error: any) {
        console.error("Create Pooja Category Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Category Info (Admin)
export const updatePoojaCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name_en, name_hi, name_mr } = req.body;
        
        const final_name_en = name_en || req.body.name;
        const nameSlug = final_name_en ? final_name_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : undefined;

        const category = await prisma.poojaCategory.update({
            where: { id: id as string },
            data: {
                name: buildLangJson(final_name_en, name_hi, name_mr),
                ...(nameSlug ? { nameSlug } : {})
            }
        });

        res.status(200).json({
            success: true,
            message: `Category updated successfully`,
            data: category
        });
    } catch (error: any) {
        console.error("Update Pooja Category Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Category Status (Admin)
export const updatePoojaCategoryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const category = await prisma.poojaCategory.update({
            where: { id: id as string },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `Category ${status.toLowerCase()} successfully`,
            data: category
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Category (Admin)
export const deletePoojaCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.poojaCategory.delete({ where: { id: id as string } });
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public/Temple: Get Approved Categories
export const getApprovedPoojaCategories = async (req: Request, res: Response) => {
    try {
        const lang = getLang(req);

        const categories = await prisma.poojaCategory.findMany({
            where: { status: "APPROVED" },
            orderBy: { createdAt: "asc" }
        });

        const localizedCategories = localize(categories, lang);

        res.status(200).json({
            success: true,
            data: localizedCategories
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
