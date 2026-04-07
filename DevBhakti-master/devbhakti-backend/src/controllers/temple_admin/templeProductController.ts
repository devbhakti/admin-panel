import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get My Products
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;

    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { templeId };

    if (search) {
      where.OR = [
        { name_en: { contains: search as string, mode: "insensitive" } },
        { description_en: { contains: search as string, mode: "insensitive" } }
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
          categoryObj: { select: { name_en: true, name_hi: true, name_mr: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
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
        categoryObj: { select: { id: true, name_en: true, name_hi: true, name_mr: true } },
        temple: { select: { id: true, name_en: true, name_hi: true, name_mr: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Get My Product By ID Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const templeId = (req as any).owner.ownerId;

    let name, description, category, categoryId, variants, image;
    let highlights, longDescription, shippingInfo, origin;

    if (req.is('multipart/form-data')) {
      const data = req.body;
      name = data.name_en || data.name;
      const name_hi = data.name_hi || null;
      const name_mr = data.name_mr || null;

      description = data.description_en || data.description;
      const description_hi = data.description_hi || null;
      const description_mr = data.description_mr || null;

      category = data.category_en || data.category;
      const category_hi = data.category_hi || null;
      const category_mr = data.category_mr || null;
      categoryId = data.category || null;

      highlights = data.highlights_en ? JSON.parse(data.highlights_en) : (data.highlights ? JSON.parse(data.highlights) : []);
      const highlights_hi = data.highlights_hi ? JSON.parse(data.highlights_hi) : [];
      const highlights_mr = data.highlights_mr ? JSON.parse(data.highlights_mr) : [];

      longDescription = data.longDescription_en || data.longDescription || null;
      const longDescription_hi = data.longDescription_hi || null;
      const longDescription_mr = data.longDescription_mr || null;

      shippingInfo = data.shippingInfo_en || data.shippingInfo || null;
      const shippingInfo_hi = data.shippingInfo_hi || null;
      const shippingInfo_mr = data.shippingInfo_mr || null;

      origin = data.origin_en || data.origin || null;
      const origin_hi = data.origin_hi || null;
      const origin_mr = data.origin_mr || null;

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

      // Re-package into a data object for prisma
      req.body.localizedData = {
          name_en: name, name_hi, name_mr,
          description_en: description, description_hi, description_mr,
          category_en: category, category_hi, category_mr,
          highlights_en: highlights, highlights_hi, highlights_mr,
          longDescription_en: longDescription, longDescription_hi, longDescription_mr,
          shippingInfo_en: shippingInfo, shippingInfo_hi, shippingInfo_mr,
          origin_en: origin, origin_hi, origin_mr
      };
    } else {
      const body = req.body;
      name = body.name_en || body.name;
      category = body.category_en || body.category;
      description = body.description_en || body.description;
      categoryId = body.category || null;
      variants = body.variants || [];
      req.body.localizedData = {
          name_en: name, name_hi: body.name_hi, name_mr: body.name_mr,
          description_en: description, description_hi: body.description_hi, description_mr: body.description_mr,
          category_en: category, category_hi: body.category_hi, category_mr: body.category_mr,
          highlights_en: body.highlights_en || [], highlights_hi: body.highlights_hi || [], highlights_mr: body.highlights_mr || [],
          longDescription_en: body.longDescription_en, longDescription_hi: body.longDescription_hi, longDescription_mr: body.longDescription_mr,
          shippingInfo_en: body.shippingInfo_en, shippingInfo_hi: body.shippingInfo_hi, shippingInfo_mr: body.shippingInfo_mr,
          origin_en: body.origin_en, origin_hi: body.origin_hi, origin_mr: body.origin_mr
      };
    }

    if (!name || !description || !category) {
      return res.status(400).json({ success: false, message: "Name, Description and Category are required" });
    }

    const product = await prisma.product.create({
      data: {
        ...req.body.localizedData,
        categoryId,
        templeId: templeId,
        status: "pending", // Force Pending
        image,
        variants: {
          create: variants.map((v: any) => ({
            name: v.name,
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

    let variants, image;
    const updateData: any = {};
    if (req.is('multipart/form-data')) {
        const body = req.body;
        if (body.name_en || body.name) updateData.name_en = body.name_en || body.name;
        if (body.name_hi !== undefined) updateData.name_hi = body.name_hi;
        if (body.name_mr !== undefined) updateData.name_mr = body.name_mr;
        
        if (body.description_en || body.description) updateData.description_en = body.description_en || body.description;
        if (body.description_hi !== undefined) updateData.description_hi = body.description_hi;
        if (body.description_mr !== undefined) updateData.description_mr = body.description_mr;

        if (body.category_en || body.category) updateData.category_en = body.category_en || body.category;
        if (body.category_hi !== undefined) updateData.category_hi = body.category_hi;
        if (body.category_mr !== undefined) updateData.category_mr = body.category_mr;
        
        if (body.highlights_en) updateData.highlights_en = JSON.parse(body.highlights_en);
        if (body.highlights_hi) updateData.highlights_hi = JSON.parse(body.highlights_hi);
        if (body.highlights_mr) updateData.highlights_mr = JSON.parse(body.highlights_mr);

        if (body.longDescription_en !== undefined) updateData.longDescription_en = body.longDescription_en;
        if (body.longDescription_hi !== undefined) updateData.longDescription_hi = body.longDescription_hi;
        if (body.longDescription_mr !== undefined) updateData.longDescription_mr = body.longDescription_mr;

        if (body.shippingInfo_en !== undefined) updateData.shippingInfo_en = body.shippingInfo_en;
        if (body.shippingInfo_hi !== undefined) updateData.shippingInfo_hi = body.shippingInfo_hi;
        if (body.shippingInfo_mr !== undefined) updateData.shippingInfo_mr = body.shippingInfo_mr;

        if (body.origin_en !== undefined) updateData.origin_en = body.origin_en;
        if (body.origin_hi !== undefined) updateData.origin_hi = body.origin_hi;
        if (body.origin_mr !== undefined) updateData.origin_mr = body.origin_mr;

        variants = body.variants ? JSON.parse(body.variants) : [];
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
        const body = req.body;
        if (body.name_en || body.name) updateData.name_en = body.name_en || body.name;
        if (body.name_hi !== undefined) updateData.name_hi = body.name_hi;
        if (body.name_mr !== undefined) updateData.name_mr = body.name_mr;
        
        if (body.description_en || body.description) updateData.description_en = body.description_en || body.description;
        if (body.description_hi !== undefined) updateData.description_hi = body.description_hi;
        if (body.description_mr !== undefined) updateData.description_mr = body.description_mr;

        if (body.category_en || body.category) updateData.category_en = body.category_en || body.category;
        if (body.category_hi !== undefined) updateData.category_hi = body.category_hi;
        if (body.category_mr !== undefined) updateData.category_mr = body.category_mr;

        if (body.highlights_en) updateData.highlights_en = body.highlights_en;
        if (body.highlights_hi) updateData.highlights_hi = body.highlights_hi;
        if (body.highlights_mr) updateData.highlights_mr = body.highlights_mr;

        if (body.longDescription_en !== undefined) updateData.longDescription_en = body.longDescription_en;
        if (body.longDescription_hi !== undefined) updateData.longDescription_hi = body.longDescription_hi;
        if (body.longDescription_mr !== undefined) updateData.longDescription_mr = body.longDescription_mr;

        if (body.shippingInfo_en !== undefined) updateData.shippingInfo_en = body.shippingInfo_en;
        if (body.shippingInfo_hi !== undefined) updateData.shippingInfo_hi = body.shippingInfo_hi;
        if (body.shippingInfo_mr !== undefined) updateData.shippingInfo_mr = body.shippingInfo_mr;

        if (body.origin_en !== undefined) updateData.origin_en = body.origin_en;
        if (body.origin_hi !== undefined) updateData.origin_hi = body.origin_hi;
        if (body.origin_mr !== undefined) updateData.origin_mr = body.origin_mr;

        variants = body.variants || [];
    }

    if (image) updateData.image = image;
    else if (req.body.removeImage === 'true') updateData.image = null;

    // Handle Variants
    if (variants && variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: id as string } });
      updateData.variants = {
        create: variants.map((v: any) => ({
          name: v.name,
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
