import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { buildLangJson, buildLangArray, getLang, localize } from "../../utils/localization";

// Get My Products
export const getMyProducts = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;

        const { page = 1, limit = 10, search, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const lang = getLang(req);
        const where: any = { sellerId };

        if (search) {
            where.OR = [
                { name: { path: ['en'], string_contains: search as string } },
                { description: { path: ['en'], string_contains: search as string } }
            ];
        }

        if (status === "out_of_stock") {
            where.variants = {
                every: {
                    stock: 0
                }
            };
        } else if (status) {
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
                take: Number(limit)
            }),
            prisma.product.count({ where })
        ]);

        res.status(200).json({
            success: true,
            data: {
                products: localize(products, lang),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        console.error("Seller Get Products Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get My Product by ID
export const getMyProductById = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;
        const { id } = req.params;

        const product = await prisma.product.findFirst({
            where: { id: id as string, sellerId },
            include: {
                variants: true,
                categoryObj: { select: { id: true, name: true } },
                seller: { select: { id: true, name: true } }
            }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const lang = getLang(req);
        res.status(200).json({ success: true, data: localize(product as any, lang) });
    } catch (error) {
        console.error("Seller Get Product By ID Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Create Product
export const createProduct = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;
        const data = req.body;
        
        // Handle images and parsing
        let image = null;
        let variants = data.variants ? (typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants) : [];
        const files = req.files as any;

        if (files) {
            const productFile = files.find((f: any) => f.fieldname === 'image');
            if (productFile) image = `/uploads/products/${productFile.filename}`;

            variants = variants.map((v: any, index: number) => {
                const variantFile = files.find((f: any) => f.fieldname === `variant_image_${index}`);
                if (variantFile) v.image = `/uploads/products/${variantFile.filename}`;
                return v;
            });
        }

        const categoryId = data.category || null;

        const product = await prisma.product.create({
            data: {
                name: buildLangJson(data.name_en || data.name, data.name_hi, data.name_mr),
                description: buildLangJson(data.description_en || data.description, data.description_hi, data.description_mr),
                category: buildLangJson(data.category_en || data.category, data.category_hi, data.category_mr),
                highlights: buildLangArray(data.highlights_en || data.highlights, data.highlights_hi, data.highlights_mr),
                longDescription: buildLangJson(data.longDescription_en, data.longDescription_hi, data.longDescription_mr),
                shippingInfo: buildLangJson(data.shippingInfo_en, data.shippingInfo_hi, data.shippingInfo_mr),
                origin: buildLangJson(data.origin_en || data.origin, data.origin_hi, data.origin_mr),
                categoryId,
                sellerId,
                status: "pending",
                image,
                rating: data.rating ? parseFloat(data.rating) : 4.5,
                weight: data.weight ? parseFloat(data.weight) : 0.5,
                length: data.length ? parseFloat(data.length) : 10,
                width: data.width ? parseFloat(data.width) : 10,
                height: data.height ? parseFloat(data.height) : 10,
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
        console.error("Seller Create Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;
        const { id } = req.params;

        const existingProduct = await prisma.product.findFirst({
            where: { id: id as string, sellerId }
        });
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or access denied" });

        const body = req.body;
        const updateData: any = {};
        let variants, image, removeImage;
        removeImage = body.removeImage === 'true' || body.removeImage === true;

        // Multilingual fields
        if (body.name_en || body.name) updateData.name = buildLangJson(body.name_en || body.name, body.name_hi, body.name_mr);
        if (body.description_en || body.description) updateData.description = buildLangJson(body.description_en || body.description, body.description_hi, body.description_mr);
        
        // Category update
        if (body.category) updateData.categoryId = body.category;
        
        if (body.highlights_en) updateData.highlights = buildLangArray(body.highlights_en, body.highlights_hi, body.highlights_mr);
        if (body.longDescription_en !== undefined) updateData.longDescription = buildLangJson(body.longDescription_en, body.longDescription_hi, body.longDescription_mr);
        if (body.shippingInfo_en !== undefined) updateData.shippingInfo = buildLangJson(body.shippingInfo_en, body.shippingInfo_hi, body.shippingInfo_mr);
        if (body.origin_en !== undefined) updateData.origin = buildLangJson(body.origin_en, body.origin_hi, body.origin_mr);

        // Shiprocket Dimensions & Rating
        if (body.rating !== undefined) updateData.rating = parseFloat(body.rating);
        if (body.weight !== undefined) updateData.weight = parseFloat(body.weight);
        if (body.length !== undefined) updateData.length = parseFloat(body.length);
        if (body.width !== undefined) updateData.width = parseFloat(body.width);
        if (body.height !== undefined) updateData.height = parseFloat(body.height);

        if (req.is('multipart/form-data')) {
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
            variants = body.variants || [];
        }

        if (image) updateData.image = image;
        else if (removeImage) updateData.image = null;

        if (variants && Array.isArray(variants)) {
            const existingVariants = variants.filter((v: any) => v.id && String(v.id).length > 20);
            const newVariants = variants.filter((v: any) => !v.id || String(v.id).length <= 20);
            const existingIds = existingVariants.map((v: any) => v.id);

            updateData.variants = {
                updateMany: {
                    where: { id: { notIn: existingIds } },
                    data: { isActive: false }
                },
                update: existingVariants.map((variant: any) => ({
                    where: { id: variant.id },
                    data: {
                        name: buildLangJson(variant.name_en || variant.name, variant.name_hi, variant.name_mr),
                        price: parseFloat(variant.price),
                        stock: parseInt(variant.stock) || 0,
                        ...(variant.hasOwnProperty('image') && { image: variant.image }),
                        isActive: true
                    }
                })),
                create: newVariants.map((variant: any) => ({
                    name: buildLangJson(variant.name_en || variant.name, variant.name_hi, variant.name_mr),
                    price: parseFloat(variant.price),
                    stock: parseInt(variant.stock) || 0,
                    image: variant.image || null,
                    isActive: true
                }))
            };
        }

        const updatedProduct = await prisma.product.update({
            where: { id: id as string },
            data: updateData,
            include: { variants: true }
        });

        const lang = getLang(req);
        res.status(200).json({ success: true, data: localize(updatedProduct, lang) });

    } catch (error) {
        console.error("Seller Update Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).owner.ownerId;
        const { id } = req.params;

        const existingProduct = await prisma.product.findFirst({
            where: { id: id as string, sellerId }
        });
        if (!existingProduct) return res.status(404).json({ success: false, message: "Product not found or access denied" });

        await prisma.product.delete({ where: { id: id as string } });

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Seller Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
