import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { localize } from "../../utils/localization";

// Get All Categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { name_en: { contains: search, mode: "insensitive" } },
        { description_en: { contains: search, mode: "insensitive" } }
      ] as any;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

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
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get Active Categories (for dropdown)
export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name_en: true,
        name_hi: true,
        name_mr: true,
        description_en: true,
        description_hi: true,
        description_mr: true
      } as any
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
      message: "Failed to retrieve active categories",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
        message: "Category not found",
        details: `Category with ID ${id} does not exist`
      });
    }

    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: localize(category, lang)
    });
  } catch (error) {
    console.error("Get Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
        message: "Category name is required",
        details: {
          name: !final_name_en ? "Category name is required" : null
        }
      });
    }

    // Check if category already exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name_en: {
          equals: final_name_en,
          mode: "insensitive"
        }
      } as any
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        details: `Category with name "${final_name_en}" already exists`
      });
    }

    // Handle image upload
    let imagePath: string | null = null;
    if (req.file) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }

    const category = await prisma.productCategory.create({
      data: {
        name_en: final_name_en,
        name_hi: name_hi || null,
        name_mr: name_mr || null,
        description_en: (description_en || req.body.description || "").trim() || null,
        description_hi: (description_hi || "").trim() || null,
        description_mr: (description_mr || "").trim() || null,
        image: imagePath,
        isActive: isActive === true || isActive === "true",
        sortOrder: parseInt(sortOrder) || 0
      } as any
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
      message: "Failed to create category",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
        message: "Category not found",
        details: `Category with ID ${id} does not exist`
      });
    }

    const final_name_en = name_en || req.body.name;

    // Check if name is being changed and if it conflicts with existing category
    if (final_name_en && final_name_en.trim() !== (existingCategory as any).name_en) {
      const duplicateCategory = await prisma.productCategory.findFirst({
        where: {
          name_en: {
            equals: final_name_en.trim(),
            mode: "insensitive"
          },
          id: { not: id as string }
        } as any
      });

      if (duplicateCategory) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
          details: `Category with name "${final_name_en}" already exists`
        });
      }
    }

    // Handle image upload
    let imagePath: string | null = existingCategory.image;
    if (req.file) {
      imagePath = `/uploads/categories/${req.file.filename}`;
    }

    const updateData: any = {};
    if (final_name_en) updateData.name_en = final_name_en.trim();
    if (name_hi !== undefined) updateData.name_hi = name_hi ? name_hi.trim() : null;
    if (name_mr !== undefined) updateData.name_mr = name_mr ? name_mr.trim() : null;
    
    if (description_en !== undefined || req.body.description !== undefined) {
      updateData.description_en = (description_en || req.body.description || "").trim() || null;
    }
    if (description_hi !== undefined) updateData.description_hi = description_hi ? description_hi.trim() : null;
    if (description_mr !== undefined) updateData.description_mr = description_mr ? description_mr.trim() : null;

    if (isActive !== undefined) updateData.isActive = isActive === true || isActive === "true";
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0;
    if (req.file) updateData.image = imagePath;

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
      message: "Failed to update category",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
        message: "Category not found",
        details: `Category with ID ${id} does not exist`
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
      message: "Failed to delete category",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
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
        message: "Category not found",
        details: `Category with ID ${id} does not exist`
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
      message: "Failed to toggle category status",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
