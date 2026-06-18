import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { buildLangJson, getLang, localize } from '../../utils/localization';

// ─── Helper: build file path ─────────────────────────────────────────────────
const getFilePath = (files: any, fieldName: string): any => {
    if (!files || !files[fieldName]) return null;
    if (fieldName === 'image') return `/uploads/mandals/${files[fieldName][0].filename}`;
    return files[fieldName].map((f: any) => `/uploads/mandals/${f.filename}`);
};

// ─── GET ALL MANDALS (paginated) ─────────────────────────────────────────────
export const getAllMandals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, search, status, isActive } = req.query;
        const lang = (req.query.lang as string) || getLang(req);

        const where: any = {};

        if (status && status !== 'ALL') {
            where.status = String(status);
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (search) {
            where.OR = [
                { name: { path: ['en'], string_contains: String(search) } },
                { name: { path: ['hi'], string_contains: String(search) } },
                { city: { contains: String(search), mode: 'insensitive' } },
                { state: { contains: String(search), mode: 'insensitive' } },
                { contactNumber: { contains: String(search), mode: 'insensitive' } },
                { presidentName: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const p = parseInt(String(page || '1'));
        const l = parseInt(String(limit || '20'));
        const skip = (p - 1) * l;

        const [mandals, total] = await Promise.all([
            prisma.mandal.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: l,
            }),
            prisma.mandal.count({ where }),
        ]);

        res.json({
            success: true,
            data: lang === 'raw' ? mandals : localize(mandals, lang),
            pagination: {
                total,
                page: p,
                limit: l,
                totalPages: Math.ceil(total / l),
            },
        });
    } catch (error: any) {
        console.error('getAllMandals error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mandals', error: error.message });
    }
};

// ─── GET MANDAL BY ID / SLUG ─────────────────────────────────────────────────
export const getMandalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const lang = getLang(req);

        const mandal = await prisma.mandal.findFirst({
            where: { OR: [{ id }, { slug: id }] },
        });

        if (!mandal) {
            res.status(404).json({ success: false, message: 'Mandal not found' });
            return;
        }

        res.json({
            success: true,
            data: lang === 'raw' ? mandal : localize(mandal, lang),
        });
    } catch (error: any) {
        console.error('getMandalById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch mandal', error: error.message });
    }
};

// ─── CREATE MANDAL (ADMIN) ───────────────────────────────────────────────────
export const createMandal = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as any;
        const data = req.body;

        if (!data.contactNumber) {
            res.status(400).json({ success: false, message: 'Contact number is required' });
            return;
        }

        // Safely parse existing banner images
        const existingBannerImages: string[] = data.existingBannerImages
            ? JSON.parse(data.existingBannerImages)
            : [];

        const mandal = await prisma.mandal.create({
            data: {
                name: JSON.stringify(buildLangJson(data.name_en || data.name, data.name_hi, data.name_mr)),
                description: JSON.stringify(buildLangJson(data.description_en || data.description, data.description_hi, data.description_mr)),
                about: data.about ? (typeof data.about === 'string' ? JSON.parse(data.about) : data.about) : undefined,
                mandalType: data.mandalType || undefined,
                presiding_deity: data.presiding_deity || undefined,
                festivals: data.festivals || undefined,
                address: data.address || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                pinCode: data.pinCode || undefined,
                contactNumber: data.contactNumber,
                email: data.email || undefined,
                presidentName: data.presidentName || undefined,
                registrationNumber: data.registrationNumber || undefined,
                verificationDocUrl: data.verificationDocUrl || undefined,
                presidentIdDocUrl: data.presidentIdDocUrl || undefined,
                // Media
                image: getFilePath(files, 'image') || data.imageUrl || undefined,
                bannerImages: [
                    ...existingBannerImages,
                    ...(getFilePath(files, 'bannerImages') || []),
                ],
                documentUrl: getFilePath(files, 'documentUrl') || data.documentUrl || undefined,
                // Meta
                slug: data.slug || undefined,
                isActive: data.isActive === 'true' || data.isActive === true,
                status: data.status || 'PENDING',
                adminNotes: data.adminNotes || undefined,
            },
        });

        res.status(201).json({ success: true, message: 'Mandal created successfully', data: mandal });
    } catch (error: any) {
        console.error('createMandal error:', error);
        res.status(500).json({ success: false, message: 'Failed to create mandal', error: error.message });
    }
};

// ─── UPDATE MANDAL (ADMIN) ───────────────────────────────────────────────────
export const updateMandal = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const files = req.files as any;
        const data = req.body;

        const existing = await prisma.mandal.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Mandal not found' });
            return;
        }

        const existingBannerImages: string[] = data.existingBannerImages
            ? JSON.parse(data.existingBannerImages)
            : (existing.bannerImages as string[]);

        const mandal = await prisma.mandal.update({
            where: { id },
            data: {
                name: JSON.stringify(buildLangJson(data.name_en || data.name, data.name_hi, data.name_mr)),
                description: JSON.stringify(buildLangJson(data.description_en || data.description, data.description_hi, data.description_mr)),
                about: data.about ? (typeof data.about === 'string' ? JSON.parse(data.about) : data.about) : undefined,
                mandalType: data.mandalType || undefined,
                presiding_deity: data.presiding_deity || undefined,
                festivals: data.festivals || undefined,
                address: data.address || undefined,
                city: data.city || undefined,
                state: data.state || undefined,
                pinCode: data.pinCode || undefined,
                contactNumber: data.contactNumber,
                email: data.email || undefined,
                presidentName: data.presidentName || undefined,
                registrationNumber: data.registrationNumber || undefined,
                verificationDocUrl: data.verificationDocUrl || undefined,
                presidentIdDocUrl: data.presidentIdDocUrl || undefined,
                // Media
                ...(files?.image && { image: getFilePath(files, 'image') }),
                bannerImages: [
                    ...existingBannerImages,
                    ...(getFilePath(files, 'bannerImages') || []),
                ],
                ...(files?.documentUrl && { documentUrl: getFilePath(files, 'documentUrl') }),
                // Meta
                slug: data.slug || existing.slug || undefined,
                isActive: data.isActive !== undefined
                    ? (data.isActive === 'true' || data.isActive === true)
                    : existing.isActive,
                status: data.status || existing.status,
                adminNotes: data.adminNotes !== undefined ? data.adminNotes : existing.adminNotes,
            },
        });

        res.json({ success: true, message: 'Mandal updated successfully', data: mandal });
    } catch (error: any) {
        console.error('updateMandal error:', error);
        res.status(500).json({ success: false, message: 'Failed to update mandal', error: error.message });
    }
};

// ─── DELETE MANDAL ───────────────────────────────────────────────────────────
export const deleteMandal = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);

        const existing = await prisma.mandal.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Mandal not found' });
            return;
        }

        await prisma.mandal.delete({ where: { id } });

        res.json({ success: true, message: 'Mandal deleted successfully' });
    } catch (error: any) {
        console.error('deleteMandal error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete mandal', error: error.message });
    }
};

// ─── TOGGLE MANDAL STATUS ────────────────────────────────────────────────────
export const toggleMandalStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        const { isActive, status, adminNotes } = req.body;

        const existing = await prisma.mandal.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Mandal not found' });
            return;
        }

        const updateData: any = {};
        if (isActive !== undefined) updateData.isActive = isActive === true || isActive === 'true';
        if (status !== undefined) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        const mandal = await prisma.mandal.update({ where: { id }, data: updateData });

        res.json({ success: true, message: 'Mandal status updated', data: mandal });
    } catch (error: any) {
        console.error('toggleMandalStatus error:', error);
        res.status(500).json({ success: false, message: 'Failed to update mandal status', error: error.message });
    }
};
