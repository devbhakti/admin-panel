import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { localize } from "../../utils/localization";

// Get All Pooja Categories (Admin)
export const getAllPoojaCategoriesAdmin = async (req: Request, res: Response) => {
    try {
        const { status, search } = req.query;
        const lang = (req.query.lang || req.headers['x-lang'] || 'en') as string;

        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.name_en = { contains: search as string, mode: "insensitive" };
        }

        const categories = await prisma.poojaCategory.findMany({
            where: where as any,
            orderBy: { createdAt: "desc" }
        });

        // Return raw data for admin so all language fields (name_en, name_hi, name_mr) are available for editing
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error: any) {
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

        const existing = await prisma.poojaCategory.findUnique({
            where: { name_en: final_name_en }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        const category = await prisma.poojaCategory.create({
            data: {
                name_en: final_name_en,
                name_hi: name_hi || null,
                name_mr: name_mr || null,
                status
            }
        });

        res.status(201).json({
            success: true,
            message: status === "PENDING" ? "Category suggested successfully" : "Category created successfully",
            data: category
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Category Info (Admin)
export const updatePoojaCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name_en, name_hi, name_mr } = req.body;

        const category = await prisma.poojaCategory.update({
            where: { id: id as string },
            data: {
                name_en: name_en || req.body.name,
                name_hi,
                name_mr
            } as any
        });

        res.status(200).json({
            success: true,
            message: `Category updated successfully`,
            data: category
        });
    } catch (error: any) {
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
        const lang = (req.query.lang || req.headers['x-lang'] || 'en') as string;

        const categories = await prisma.poojaCategory.findMany({
            where: { status: "APPROVED" } as any,
            orderBy: { name_en: "asc" } as any
        });

        const localizedCategories = localize(categories as any[], lang);

        res.status(200).json({
            success: true,
            data: localizedCategories
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
