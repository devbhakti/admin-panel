import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { getLang, localize, buildLangJson } from "../../utils/localization";

// Get My Products
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;

    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(String(page), 10) - 1) * parseInt(String(limit), 10);

    const where: any = { templeId };

    if (search) {
      where.OR = [
        { name: { path: ['en'], string_contains: search as string } },
        { description: { path: ['en'], string_contains: search as string } }
      ];
    }

    if (status) {
      where.status = status as string;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: true,
          categoryObj: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(String(limit), 10)
      }),
      prisma.product.count({ where })
    ]);

    const lang = getLang(req);
    res.status(200).json({
      success: true,
      data: {
        products: localize(products, lang),
        pagination: {
          page: parseInt(String(page), 10),
          limit: parseInt(String(limit), 10),
          total,
          pages: Math.ceil(total / parseInt(String(limit), 10))
        }
      }
    });

  } catch (error) {
    console.error("Get My Products Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get My Product by ID
export const getMyProductById = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: { id: id as string, templeId },
      include: {
        variants: true,
        categoryObj: { select: { id: true, name: true } },
        temple: { select: { id: true, name: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const lang = getLang(req);
    res.status(200).json({ success: true, data: localize(product, lang) });
  } catch (error) {
    console.error("Get My Product By ID Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;

    let data = req.body;
    let image;
    let variants = [];

    if (req.is('multipart/form-data')) {
      variants = data.variants ? JSON.parse(data.variants) : [];
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
      variants = data.variants || [];
    }

    const { 
        name_en, name_hi, name_mr,
        description_en, description_hi, description_mr,
        category, // This is categoryId or category name? In original it was used for both.
        category_en, category_hi, category_mr,
        highlights_en, highlights_hi, highlights_mr,
        longDescription_en, longDescription_hi, longDescription_mr,
        shippingInfo_en, shippingInfo_hi, shippingInfo_mr,
        origin_en, origin_hi, origin_mr
    } = data;

    const product = await prisma.product.create({
      data: {
        name: buildLangJson(name_en || data.name, name_hi, name_mr),
        description: buildLangJson(description_en || data.description, description_hi, description_mr),
        category: buildLangJson(category_en || category, category_hi, category_mr),
        highlights: buildLangJson(
            typeof highlights_en === 'string' ? JSON.parse(highlights_en) : (highlights_en || []),
            typeof highlights_hi === 'string' ? JSON.parse(highlights_hi) : (highlights_hi || []),
            typeof highlights_mr === 'string' ? JSON.parse(highlights_mr) : (highlights_mr || [])
        ),
        longDescription: buildLangJson(longDescription_en, longDescription_hi, longDescription_mr),
        shippingInfo: buildLangJson(shippingInfo_en, shippingInfo_hi, shippingInfo_mr),
        origin: buildLangJson(origin_en, origin_hi, origin_mr),
        categoryId: category, // assuming 'category' field in req.body might be the ID
        templeId: templeId,
        status: "pending",
        image,
        variants: {
          create: variants.map((v: any) => ({
            name: buildLangJson(v.name_en || v.name, v.name_hi, v.name_mr),
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
            image: v.image || null
          }))
        }
      },
      include: { variants: true }
    });

    res.status(201).json({ success: true, data: product });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;
    const { id } = req.params;

    // Verify ownership
    const existingProduct = await prisma.product.findFirst({
      where: { id: id as string, templeId }
    });
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or access denied" });

    let data = req.body;
    let variants, image;
    const updateData: any = {};

    if (req.is('multipart/form-data')) {
        variants = data.variants ? JSON.parse(data.variants) : [];
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
        variants = data.variants || [];
    }

    const { 
        name_en, name_hi, name_mr,
        description_en, description_hi, description_mr,
        category_en, category_hi, category_mr,
        category: categoryId,
        highlights_en, highlights_hi, highlights_mr,
        longDescription_en, longDescription_hi, longDescription_mr,
        shippingInfo_en, shippingInfo_hi, shippingInfo_mr,
        origin_en, origin_hi, origin_mr,
        removeImage
    } = data;

    if (name_en !== undefined) updateData.name = buildLangJson(name_en || data.name, name_hi, name_mr);
    if (description_en !== undefined) updateData.description = buildLangJson(description_en || data.description, description_hi, description_mr);
    if (category_en !== undefined) updateData.category = buildLangJson(category_en, category_hi, category_mr);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    
    if (highlights_en !== undefined) {
        updateData.highlights = buildLangJson(
            typeof highlights_en === 'string' ? JSON.parse(highlights_en) : highlights_en,
            typeof highlights_hi === 'string' ? JSON.parse(highlights_hi) : highlights_hi,
            typeof highlights_mr === 'string' ? JSON.parse(highlights_mr) : highlights_mr
        );
    }

    if (longDescription_en !== undefined) updateData.longDescription = buildLangJson(longDescription_en, longDescription_hi, longDescription_mr);
    if (shippingInfo_en !== undefined) updateData.shippingInfo = buildLangJson(shippingInfo_en, shippingInfo_hi, shippingInfo_mr);
    if (origin_en !== undefined) updateData.origin = buildLangJson(origin_en, origin_hi, origin_mr);

    if (image) updateData.image = image;
    else if (removeImage === 'true') updateData.image = null;

    // Handle Variants
    if (variants && variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: id as string } });
      updateData.variants = {
        create: variants.map((v: any) => ({
          name: buildLangJson(v.name_en || v.name, v.name_hi, v.name_mr),
          price: parseFloat(v.price),
          stock: parseInt(v.stock) || 0,
          image: v.image || null
        }))
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: updateData,
      include: { variants: true }
    });

    res.status(200).json({ success: true, data: updatedProduct });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;
    const { id } = req.params;

    const existingProduct = await prisma.product.findFirst({
      where: { id: id as string, templeId }
    });
    if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or access denied" });

    await prisma.product.delete({ where: { id: id as string } });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
