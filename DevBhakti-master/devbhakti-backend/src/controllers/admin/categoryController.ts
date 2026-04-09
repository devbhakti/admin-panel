import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { buildLangJson, getLang, localize } from "../../utils/localization";
import slugify from "slugify";

// Get All Categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { path: ['en'], string_contains: search as string } },
        { description: { path: ['en'], string_contains: search as string } }
      ] as any;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const lang = getLang(req);

    const [categories, total] = await Promise.all([
      prisma.productCategory.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma.productCategory.count({ where })
    ]);

    const localizedCategories = localize(categories as any[], lang);

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories: localizedCategories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

// Get Active Categories (for dropdown)
export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const lang = getLang(req);

    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    const localizedCategories = localize(categories as any[], lang);

    res.status(200).json({
      success: true,
      message: "Active categories retrieved successfully",
      data: localizedCategories
    });
  } catch (error) {
    console.error("Get Active Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve active categories"
    });
  }
};

// Get Category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Return RAW JSON for Admin Edit support
    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    console.error("Get Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category"
    });
  }
};

// Create Category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { 
      name_en, name_hi, name_mr,
      description_en, description_hi, description_mr,
      isActive = true, sortOrder = 0 
    } = req.body;

    const final_name_en = (name_en || req.body.name || "").trim();

    // Validate required fields
    if (!final_name_en) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const nameSlug = slugify(final_name_en, { lower: true });

    // Check if category already exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { nameSlug }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists with this name"
      });
    }

    // Handle image upload
    let imagePath: string | null = null;
    if (req.file) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }

    const category = await prisma.productCategory.create({
      data: {
        name: buildLangJson(final_name_en, name_hi, name_mr),
        nameSlug,
        description: buildLangJson(description_en || req.body.description || "", description_hi, description_mr),
        image: imagePath,
        isActive: isActive === true || isActive === "true",
        sortOrder: parseInt(sortOrder) || 0
      }
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
};

// Update Category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name_en, name_hi, name_mr,
      description_en, description_hi, description_mr,
      isActive, sortOrder 
    } = req.body;

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id: id as string }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const updateData: any = {};
    
    if (name_en || name_hi || name_mr) {
      const currentName = existingCategory.name as any || {};
      const new_name_en = name_en || currentName.en;
      updateData.name = buildLangJson(new_name_en, name_hi || currentName.hi, name_mr || currentName.mr);
      
      if (name_en) {
        updateData.nameSlug = slugify(name_en, { lower: true });
        // Check for slug conflict
        const conflict = await prisma.productCategory.findFirst({
          where: { nameSlug: updateData.nameSlug, id: { not: String(id) } }
        });
        if (conflict) return res.status(409).json({ success: false, message: "Another category with this name already exists" });
      }
    }

    if (description_en !== undefined || description_hi !== undefined || description_mr !== undefined) {
      const currentDesc = existingCategory.description as any || {};
      updateData.description = buildLangJson(
        description_en !== undefined ? description_en : currentDesc.en,
        description_hi !== undefined ? description_hi : currentDesc.hi,
        description_mr !== undefined ? description_mr : currentDesc.mr
      );
    }

    if (isActive !== undefined) updateData.isActive = isActive === true || isActive === "true";
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0;
    
    if (req.file) {
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    const category = await prisma.productCategory.update({
      where: { id: id as string },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
};

// Delete Category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category has products
    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with products",
        details: `Category has ${category._count.products} products. Please delete or reassign products first.`
      });
    }

    await prisma.productCategory.delete({
      where: { id: id as string }
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
};

// Toggle Category Status
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.productCategory.findUnique({
      where: { id: id as string }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const updatedCategory = await prisma.productCategory.update({
      where: { id: id as string },
      data: {
        isActive: !category.isActive
      }
    });

    res.status(200).json({
      success: true,
      message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedCategory
    });
  } catch (error) {
    console.error("Toggle Category Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle category status"
    });
  }
};
