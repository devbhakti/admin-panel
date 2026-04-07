import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { localize } from "../../utils/localization";

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    // Handle both JSON and FormData
    let name_en, name_hi, name_mr;
    let description_en, description_hi, description_mr;
    let category_en, category_hi, category_mr;
    let highlights_en, highlights_hi, highlights_mr;
    let longDescription_en, longDescription_hi, longDescription_mr;
    let shippingInfo_en, shippingInfo_hi, shippingInfo_mr;
    let origin_en, origin_hi, origin_mr;
    
    let categoryId, templeId, status, variants, image, rating;

    if (req.is('multipart/form-data')) {
      // FormData handling
      name_en = req.body.name_en || req.body.name; // Fallback to "name" if frontend isn't updated yet
      name_hi = req.body.name_hi;
      name_mr = req.body.name_mr;

      description_en = req.body.description_en || req.body.description;
      description_hi = req.body.description_hi;
      description_mr = req.body.description_mr;

      category_en = req.body.category_en || req.body.category;
      category_hi = req.body.category_hi;
      category_mr = req.body.category_mr;

      highlights_en = req.body.highlights_en || req.body.highlights;
      highlights_hi = req.body.highlights_hi;
      highlights_mr = req.body.highlights_mr;

      longDescription_en = req.body.longDescription_en || req.body.longDescription;
      longDescription_hi = req.body.longDescription_hi;
      longDescription_mr = req.body.longDescription_mr;

      shippingInfo_en = req.body.shippingInfo_en || req.body.shippingInfo;
      shippingInfo_hi = req.body.shippingInfo_hi;
      shippingInfo_mr = req.body.shippingInfo_mr;

      origin_en = req.body.origin_en || req.body.origin;
      origin_hi = req.body.origin_hi;
      origin_mr = req.body.origin_mr;

      categoryId = req.body.categoryId || req.body.category || null;
      templeId = req.body.templeId || null;
      status = req.body.status || "pending";
      rating = req.body.rating ? parseFloat(req.body.rating) : undefined;

      // Parse variants from JSON string
      variants = req.body.variants ? JSON.parse(req.body.variants) : [];

      // Handle file upload
      const files = req.files as Express.Multer.File[];
      if (files) {
        const productFile = files.find(f => f.fieldname === 'image');
        if (productFile) image = `/uploads/products/${productFile.filename}`;

        variants = variants.map((v: any, index: number) => {
          const variantFile = files.find(f => f.fieldname === `variant_image_${index}`);
          if (variantFile) v.image = `/uploads/products/${variantFile.filename}`;
          return v;
        });
      }
    } else {
      // JSON handling
      const {
        name_en: nEn, name_hi: nHi, name_mr: nMr,
        description_en: dEn, description_hi: dHi, description_mr: dMr,
        category_en: cEn, category_hi: cHi, category_mr: cMr,
        highlights_en: hEn, highlights_hi: hHi, highlights_mr: hMr,
        longDescription_en: ldEn, longDescription_hi: ldHi, longDescription_mr: ldMr,
        shippingInfo_en: sEn, shippingInfo_hi: sHi, shippingInfo_mr: sMr,
        origin_en: oEn, origin_hi: oHi, origin_mr: oMr,
        categoryId: productCategoryId,
        templeId: productTempleId,
        status: productStatus = "pending",
        variants: productVariants,
        rating: productRating
      } = req.body;

      name_en = nEn || req.body.name;
      name_hi = nHi;
      name_mr = nMr;
      description_en = dEn || req.body.description;
      description_hi = dHi;
      description_mr = dMr;
      category_en = cEn || req.body.category;
      category_hi = cHi;
      category_mr = cMr;
      highlights_en = hEn || req.body.highlights;
      highlights_hi = hHi;
      highlights_mr = hMr;
      longDescription_en = ldEn || req.body.longDescription;
      longDescription_hi = ldHi;
      longDescription_mr = ldMr;
      shippingInfo_en = sEn || req.body.shippingInfo;
      shippingInfo_hi = sHi;
      shippingInfo_mr = sMr;
      origin_en = oEn || req.body.origin;
      origin_hi = oHi;
      origin_mr = oMr;

      categoryId = productCategoryId || req.body.category || null;
      templeId = productTempleId || null;
      status = productStatus;
      variants = productVariants || [];
      rating = productRating;
    }

    // Validate required fields (English is mandatory)
    if (!name_en || !description_en || !category_en) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name_en, description_en, category_en are required"
      });
    }

    const createData: any = {
      name_en, name_hi, name_mr,
      description_en, description_hi, description_mr,
      category_en, category_hi, category_mr,
      highlights_en, highlights_hi, highlights_mr,
      longDescription_en, longDescription_hi, longDescription_mr,
      shippingInfo_en, shippingInfo_hi, shippingInfo_mr,
      origin_en, origin_hi, origin_mr,
      status,
      rating,
      image: image || null,
      variants: {
        create: variants.map((variant: any) => ({
          name_en: variant.name_en || variant.name,
          name_hi: variant.name_hi,
          name_mr: variant.name_mr,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock) || 0,
          image: variant.image || null
        }))
      }
    };

    // Handle Category
    if (categoryId) {
      const categoryRecord = await prisma.productCategory.findUnique({ where: { id: categoryId as string } });
      if (categoryRecord) {
        createData.categoryId = categoryId;
        createData.category_en = (categoryRecord as any).name_en;
      }
    }

    // Handle Vendor (Temple or Seller)
    if (templeId && templeId !== "general") {
      const dbTemple = await prisma.temple.findUnique({ where: { id: templeId as string } });
      if (dbTemple) {
        createData.templeId = dbTemple.id;
      } else {
        const seller = await prisma.sellerProfile.findUnique({ where: { id: templeId as string } });
        if (seller) {
          createData.sellerId = seller.id;
        } else {
          return res.status(400).json({
            success: false,
            message: "Invalid vendor reference"
          });
        }
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: createData,
      include: {
        variants: true,
        categoryObj: true,
        temple: true,
        seller: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
        details: "A product with this name already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating product",
    });
  }
};

// Get All Products (Admin)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category, status, templeId, date, productId } = req.query;

    const skip = search ? 0 : (Number(page) - 1) * Number(limit);
    const take = search ? 100 : Number(limit);

    // Build where clause
    const where: any = { AND: [] };

    if (productId) {
      where.AND.push({ id: productId as string });
    }

    if (search) {
      where.AND.push({
        OR: [
          { name_en: { contains: search as string, mode: "insensitive" } },
          { description_en: { contains: search as string, mode: "insensitive" } }
        ]
      });
    }

    if (category) {
      where.AND.push({ category });
    }

    if (status) {
      where.AND.push({ status });
    }

    if (templeId) {
      if (templeId === "admin") {
        where.AND.push({ templeId: null });
        where.AND.push({ sellerId: null });
      } else {
        where.AND.push({
          OR: [
            { templeId: templeId as string },
            { sellerId: templeId as string }
          ]
        });
      }
    }

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.AND.push({
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      });
    }

    // Remove empty AND if no filters
    if (where.AND.length === 0) delete where.AND;

    const [products, total, pendingCount, approvedCount, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
          categoryObj: {
            select: {
              id: true,
              name_en: true, name_hi: true, name_mr: true,
              description_en: true, description_hi: true, description_mr: true
            }
          },
          temple: {
            select: {
              id: true,
              name_en: true, name_hi: true, name_mr: true,
              location_en: true, location_hi: true, location_mr: true,
              user: {
                select: {
                  role: true
                }
              }
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              location: true,
              user: {
                select: {
                  role: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.product.count({ where }),
      prisma.product.count({ where: { status: 'pending' } }),
      prisma.product.count({ where: { status: 'approved' } }),
      prisma.product.count()
    ]);

    let finalProducts = products;

    // Rank results if searching
    if (search) {
      const lowQuery = String(search).toLowerCase();
      finalProducts.sort((a, b) => {
        const nameA = ((a as any).name_en || '').toLowerCase();
        const nameB = ((b as any).name_en || '').toLowerCase();

        // Exact match priority
        if (nameA === lowQuery && nameB !== lowQuery) return -1;
        if (nameB === lowQuery && nameA !== lowQuery) return 1;

        // Starts with match priority
        if (nameA.startsWith(lowQuery) && !nameB.startsWith(lowQuery)) return -1;
        if (nameB.startsWith(lowQuery) && !nameA.startsWith(lowQuery)) return 1;

        return 0;
      });

      // After ranking, apply pagination manually if searching
      const start = (Number(page) - 1) * Number(limit);
      finalProducts = finalProducts.slice(start, start + Number(limit));
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products: finalProducts,
        stats: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      details: error instanceof Error ? error.message : "Unknown error occurred",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get Product by ID (Admin - View ANY product)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: id as string
      },
      include: {
        variants: true,
        categoryObj: {
          select: {
            id: true,
            name_en: true, name_hi: true, name_mr: true,
            description_en: true, description_hi: true, description_mr: true
          }
        },
        temple: {
          select: {
            id: true,
            name_en: true, name_hi: true, name_mr: true,
            location_en: true, location_hi: true, location_mr: true,
            description_en: true, description_hi: true, description_mr: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            location: true,
            description: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Public Product by ID (Strict filters)
export const getPublicProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: id as string,
        status: "approved",
        OR: [
          {
            temple: {
              user: {
                isVerified: true,
                role: { in: ['INSTITUTION', 'SELLER'] }
              }
            }
          },
          {
            seller: {
              user: {
                isVerified: true
              },
              isActive: true
            }
          },
          {
            AND: [
              { templeId: null },
              { sellerId: null }
            ]
          }
        ]
      },
      include: {
        variants: {
          where: { stock: { gt: 0 } }
        },
        categoryObj: {
          select: {
            id: true,
            name_en: true, name_hi: true, name_mr: true,
            description_en: true, description_hi: true, description_mr: true
          }
        },
        temple: {
          select: {
            id: true,
            name_en: true,
            location_en: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not approved"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Get Public Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Handle both JSON and FormData
    let name_en, name_hi, name_mr;
    let description_en, description_hi, description_mr;
    let category_en, category_hi, category_mr;
    let highlights_en, highlights_hi, highlights_mr;
    let longDescription_en, longDescription_hi, longDescription_mr;
    let shippingInfo_en, shippingInfo_hi, shippingInfo_mr;
    let origin_en, origin_hi, origin_mr;

    let categoryId, templeId, status, variants, image, removeImage, rating;

    if (req.is('multipart/form-data')) {
      // FormData handling
      name_en = req.body.name_en || req.body.name;
      name_hi = req.body.name_hi;
      name_mr = req.body.name_mr;

      description_en = req.body.description_en || req.body.description;
      description_hi = req.body.description_hi;
      description_mr = req.body.description_mr;

      category_en = req.body.category_en || req.body.category;
      category_hi = req.body.category_hi;
      category_mr = req.body.category_mr;

      highlights_en = req.body.highlights_en || req.body.highlights;
      highlights_hi = req.body.highlights_hi;
      highlights_mr = req.body.highlights_mr;

      longDescription_en = req.body.longDescription_en || req.body.longDescription;
      longDescription_hi = req.body.longDescription_hi;
      longDescription_mr = req.body.longDescription_mr;

      shippingInfo_en = req.body.shippingInfo_en || req.body.shippingInfo;
      shippingInfo_hi = req.body.shippingInfo_hi;
      shippingInfo_mr = req.body.shippingInfo_mr;

      origin_en = req.body.origin_en || req.body.origin;
      origin_hi = req.body.origin_hi;
      origin_mr = req.body.origin_mr;

      categoryId = req.body.categoryId || req.body.category || null;
      templeId = req.body.templeId || null;
      status = req.body.status;
      rating = req.body.rating ? parseFloat(req.body.rating) : undefined;

      // Parse variants from JSON string
      variants = req.body.variants ? JSON.parse(req.body.variants) : [];

      // Handle file upload
      const files = req.files as Express.Multer.File[];
      if (files) {
        const productFile = files.find(f => f.fieldname === 'image');
        if (productFile) image = `/uploads/products/${productFile.filename}`;

        variants = variants.map((v: any, index: number) => {
          const variantFile = files.find(f => f.fieldname === `variant_image_${index}`);
          if (variantFile) v.image = `/uploads/products/${variantFile.filename}`;
          return v;
        });
      }

      // Handle image removal flag
      removeImage = req.body.removeImage === 'true';
    } else {
      // JSON handling
      const {
        name_en: nEn, name_hi: nHi, name_mr: nMr,
        description_en: dEn, description_hi: dHi, description_mr: dMr,
        category_en: cEn, category_hi: cHi, category_mr: cMr,
        highlights_en: hEn, highlights_hi: hHi, highlights_mr: hMr,
        longDescription_en: ldEn, longDescription_hi: ldHi, longDescription_mr: ldMr,
        shippingInfo_en: sEn, shippingInfo_hi: sHi, shippingInfo_mr: sMr,
        origin_en: oEn, origin_hi: oHi, origin_mr: oMr,
        categoryId: productCategoryId,
        templeId: productTempleId,
        status: productStatus,
        variants: productVariants,
        rating: productRating
      } = req.body;

      name_en = nEn || req.body.name;
      name_hi = nHi;
      name_mr = nMr;
      description_en = dEn || req.body.description;
      description_hi = dHi;
      description_mr = dMr;
      category_en = cEn || req.body.category;
      category_hi = cHi;
      category_mr = cMr;
      highlights_en = hEn || req.body.highlights;
      highlights_hi = hHi;
      highlights_mr = hMr;
      longDescription_en = ldEn || req.body.longDescription;
      longDescription_hi = ldHi;
      longDescription_mr = ldMr;
      shippingInfo_en = sEn || req.body.shippingInfo;
      shippingInfo_hi = sHi;
      shippingInfo_mr = sMr;
      origin_en = oEn || req.body.origin;
      origin_hi = oHi;
      origin_mr = oMr;

      categoryId = productCategoryId || req.body.category || null;
      templeId = productTempleId || null;
      status = productStatus;
      variants = productVariants || [];
      rating = productRating;
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id as string },
      include: { variants: true }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const updateData: any = {};

    // Validate and handle categoryId
    if (categoryId) {
      const categoryRecord = await prisma.productCategory.findUnique({
        where: { id: categoryId as string }
      });
      if (categoryRecord) {
        updateData.categoryId = categoryId;
        updateData.category_en = (categoryRecord as any).name_en;
      }
    }

    // Vendor Logic
    if (templeId && templeId !== "general") {
      const dbTemple = await prisma.temple.findUnique({ where: { id: templeId as string } });
      if (dbTemple) {
        updateData.templeId = dbTemple.id;
        updateData.sellerId = null;
      } else {
        const seller = await prisma.sellerProfile.findUnique({ where: { id: templeId as string } });
        if (seller) {
          updateData.sellerId = seller.id;
          updateData.templeId = null;
        }
      }
    } else if (templeId === "general") {
      updateData.templeId = null;
      updateData.sellerId = null;
    }

    if (name_en) updateData.name_en = name_en;
    if (name_hi !== undefined) updateData.name_hi = name_hi;
    if (name_mr !== undefined) updateData.name_mr = name_mr;

    if (description_en) updateData.description_en = description_en;
    if (description_hi !== undefined) updateData.description_hi = description_hi;
    if (description_mr !== undefined) updateData.description_mr = description_mr;

    if (category_en) updateData.category_en = category_en;
    if (category_hi !== undefined) updateData.category_hi = category_hi;
    if (category_mr !== undefined) updateData.category_mr = category_mr;

    if (highlights_en !== undefined) updateData.highlights_en = highlights_en;
    if (highlights_hi !== undefined) updateData.highlights_hi = highlights_hi;
    if (highlights_mr !== undefined) updateData.highlights_mr = highlights_mr;

    if (longDescription_en !== undefined) updateData.longDescription_en = longDescription_en;
    if (longDescription_hi !== undefined) updateData.longDescription_hi = longDescription_hi;
    if (longDescription_mr !== undefined) updateData.longDescription_mr = longDescription_mr;

    if (shippingInfo_en !== undefined) updateData.shippingInfo_en = shippingInfo_en;
    if (shippingInfo_hi !== undefined) updateData.shippingInfo_hi = shippingInfo_hi;
    if (shippingInfo_mr !== undefined) updateData.shippingInfo_mr = shippingInfo_mr;

    if (origin_en !== undefined) updateData.origin_en = origin_en;
    if (origin_hi !== undefined) updateData.origin_hi = origin_hi;
    if (origin_mr !== undefined) updateData.origin_mr = origin_mr;

    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = typeof rating === 'string' ? parseFloat(rating) : rating;

    if (image) {
      updateData.image = image;
    } else if (removeImage) {
      updateData.image = null;
    }

    // Handle variants update safely
    if (variants && Array.isArray(variants)) {
      try {
        await prisma.productVariant.deleteMany({
          where: { productId: id as string }
        });

        updateData.variants = {
          create: variants.map((variant: any) => ({
            name_en: variant.name_en || variant.name,
            name_hi: variant.name_hi,
            name_mr: variant.name_mr,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock) || 0,
            image: variant.image || null
          }))
        };
      } catch (err: any) {
        console.warn("Could not update variants:", err.message);
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: updateData,
      include: {
        variants: true,
        categoryObj: true,
        temple: true,
        seller: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error: any) {
    console.error("Update Product Error:", error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Unique constraint violation",
        details: "A product with this name already exists or similar conflict."
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while updating product",
      details: error.message
    });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: id as string }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Delete product (variants will be deleted due to cascade)
    await prisma.product.delete({
      where: { id: id as string }
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Toggle Product Status (Approve/Reject/Pending)
export const toggleProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: pending, approved, or rejected"
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: id as string }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: { status },
      include: {
        variants: true,
        temple: {
          select: {
            id: true,
            name_en: true,
            location_en: true,
            user: {
              select: {
                role: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      data: updatedProduct
    });
  } catch (error) {
    console.error("Toggle Product Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Products by Temple (for temple panel)
export const getProductsByTemple = async (req: Request, res: Response) => {
  try {
    const { templeId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { templeId };
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name_en: { contains: String(search), mode: 'insensitive' } },
        { description_en: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
          categoryObj: {
            select: {
              id: true,
              name_en: true, name_hi: true, name_mr: true,
              description_en: true, description_hi: true, description_mr: true
            }
          },
          temple: {
            select: {
              id: true,
              name_en: true,
              location_en: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: search ? 100 : Number(limit),
        skip: search ? 0 : (Number(page) - 1) * Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    let finalProducts = products;

    // Rank results if searching
    if (search) {
      const lowQuery = String(search).toLowerCase();
      finalProducts.sort((a, b) => {
        const nameA = ((a as any).name_en || '').toLowerCase();
        const nameB = ((b as any).name_en || '').toLowerCase();

        // Exact match priority
        if (nameA === lowQuery && nameB !== lowQuery) return -1;
        if (nameB === lowQuery && nameA !== lowQuery) return 1;

        // Starts with match priority
        if (nameA.startsWith(lowQuery) && !nameB.startsWith(lowQuery)) return -1;
        if (nameB.startsWith(lowQuery) && !nameA.startsWith(lowQuery)) return 1;

        return 0;
      });

      // After ranking, apply pagination manually if searching
      const start = (Number(page) - 1) * Number(limit);
      finalProducts = finalProducts.slice(start, start + Number(limit));
    }

    res.status(200).json({
      success: true,
      data: {
        products: finalProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get Products by Temple Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Public Products (for landing page - only approved products)
export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, category, templeId } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: "approved",
      OR: [
        {
          temple: {
            user: {
              isVerified: true,
              role: { in: ['INSTITUTION', 'SELLER'] }
            }
          }
        },
        {
          seller: {
            user: {
              isVerified: true
            },
            isActive: true
          }
        },
        {
          AND: [
            { templeId: null },
            { sellerId: null }
          ]
        }
      ]
    };

    const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

    if (search) {
      where.OR = [
        { name_en: { contains: search as string, mode: "insensitive" } },
        { description_en: { contains: search as string, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.categoryObj = {
        name_en: { contains: category as string, mode: "insensitive" }
      };
    }

    if (templeId) {
      where.templeId = templeId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            where: { stock: { gt: 0 } } // Only show variants with stock
          },
          categoryObj: {
            select: {
              id: true,
              name_en: true,
              name_hi: true,
              name_mr: true,
              description_en: true,
              description_hi: true,
              description_mr: true,
            }
          },
          temple: {
            select: {
              id: true,
              name_en: true,
              name_hi: true,
              name_mr: true,
              location_en: true,
              location_hi: true,
              location_mr: true,
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: search ? 100 : Number(limit),
        skip: search ? 0 : (Number(page) - 1) * Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    let finalProducts = products.map(p => localize(p, lang));

    // Rank results if searching
    if (search) {
      const lowQuery = String(search).toLowerCase();
      finalProducts.sort((a, b) => {
        const nameA = ((a as any).name || "").toLowerCase();
        const nameB = ((b as any).name || "").toLowerCase();

        // Exact match priority
        if (nameA === lowQuery && nameB !== lowQuery) return -1;
        if (nameB === lowQuery && nameA !== lowQuery) return 1;

        // Starts with match priority
        if (nameA.startsWith(lowQuery) && !nameB.startsWith(lowQuery)) return -1;
        if (nameB.startsWith(lowQuery) && !nameA.startsWith(lowQuery)) return 1;

        return 0;
      });

      // After ranking, apply pagination manually if searching
      const start = (Number(page) - 1) * Number(limit);
      finalProducts = finalProducts.slice(start, start + Number(limit));
    }

    res.status(200).json({
      success: true,
      data: {
        products: finalProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Get Public Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get All Potential Product Owners (Temples & Sellers)
export const getProductOwners = async (req: Request, res: Response) => {
  try {
    const [temples, sellers] = await Promise.all([
      prisma.temple.findMany({
        select: {
          id: true,
          name_en: true,
          userId: true,
          user: { select: { role: true } }
        }
      }),
      prisma.sellerProfile.findMany({
        select: {
          id: true,
          name: true,
          userId: true,
          user: { select: { role: true } }
        }
      })
    ]);

    const owners = [
      ...temples.map(t => ({
        id: t.id,
        name: (t as any).name_en,
        type: 'Temple',
        userId: t.userId
      })),
      ...sellers.map(s => ({
        id: s.id,
        name: s.name,
        type: 'Seller',
        userId: s.userId
      }))
    ].sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      data: owners
    });
  } catch (error: any) {
    console.error("Get Product Owners Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch owners",
      details: error.message
    });
  }
};
