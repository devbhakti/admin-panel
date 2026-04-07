import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getMyPoojas = async (req: Request, res: Response) => {
    try {
        const templeId = (req as any).owner.ownerId;

        const poojas = await prisma.pooja.findMany({
            where: { templeId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: poojas });
    } catch (error: any) {
        console.error('Fetch Poojas Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createMyPooja = async (req: Request, res: Response) => {
    try {
        const templeId = (req as any).owner.ownerId;
        const file = req.file;
        const data = req.body;

        const pooja = await prisma.pooja.create({
            data: {
                name_en: data.name_en || data.name,
                name_hi: data.name_hi || null,
                name_mr: data.name_mr || null,
                category_en: data.category_en || data.category,
                category_hi: data.category_hi || null,
                category_mr: data.category_mr || null,
                price: parseFloat(data.price),
                duration_en: data.duration || "N/A",
                description_en: data.description_en ? JSON.parse(data.description_en) : (data.description ? JSON.parse(data.description) : []),
                description_hi: data.description_hi ? JSON.parse(data.description_hi) : [],
                description_mr: data.description_mr ? JSON.parse(data.description_mr) : [],
                time: data.time || '',
                about_en: data.about_en || data.about || null,
                about_hi: data.about_hi || null,
                about_mr: data.about_mr || null,
                benefits_en: data.benefits_en ? JSON.parse(data.benefits_en) : (data.benefits ? JSON.parse(data.benefits) : []),
                benefits_hi: data.benefits_hi ? JSON.parse(data.benefits_hi) : [],
                benefits_mr: data.benefits_mr ? JSON.parse(data.benefits_mr) : [],
                bullets_en: data.bullets_en ? JSON.parse(data.bullets_en) : (data.bullets ? JSON.parse(data.bullets) : []),
                bullets_hi: data.bullets_hi ? JSON.parse(data.bullets_hi) : [],
                bullets_mr: data.bullets_mr ? JSON.parse(data.bullets_mr) : [],
                process_en: data.process_en || data.process || null,
                process_hi: data.process_hi || null,
                process_mr: data.process_mr || null,
                processSteps: data.processSteps ? JSON.parse(data.processSteps) : [],
                templeDetails_en: data.templeDetails_en || data.templeDetails || null,
                templeDetails_hi: data.templeDetails_hi || null,
                templeDetails_mr: data.templeDetails_mr || null,
                packages: data.packages ? JSON.parse(data.packages) : [],
                faqs: data.faqs ? JSON.parse(data.faqs) : [],
                image: file ? `/uploads/poojas/${file.filename}` : null,
                templeId: templeId,
                status: data.status === 'false' ? false : true
            }
        });

        res.status(201).json({ success: true, data: pooja });
    } catch (error: any) {
        console.error('Create Pooja Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMyPooja = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;
        const file = req.file;
        const data = req.body;

        const existingPooja = await prisma.pooja.findFirst({
            where: { id: String(id), templeId }
        });

        if (!existingPooja) {
            return res.status(404).json({ success: false, message: 'Pooja not found or unauthorized' });
        }

        const updatedPooja = await prisma.pooja.update({
            where: { id: String(id) },
            data: {
                name_en: data.name_en || (data.name !== undefined ? data.name : undefined),
                name_hi: data.name_hi !== undefined ? data.name_hi : undefined,
                name_mr: data.name_mr !== undefined ? data.name_mr : undefined,
                category_en: data.category_en || (data.category !== undefined ? data.category : undefined),
                category_hi: data.category_hi !== undefined ? data.category_hi : undefined,
                category_mr: data.category_mr !== undefined ? data.category_mr : undefined,
                price: data.price !== undefined ? parseFloat(data.price) : undefined,
                duration_en: data.duration || existingPooja.duration_en || "N/A",
                description_en: data.description_en ? JSON.parse(data.description_en) : (data.description ? JSON.parse(data.description) : undefined),
                description_hi: data.description_hi ? JSON.parse(data.description_hi) : undefined,
                description_mr: data.description_mr ? JSON.parse(data.description_mr) : undefined,
                time: data.time || existingPooja.time || "",
                about_en: data.about_en !== undefined ? data.about_en : (data.about !== undefined ? data.about : undefined),
                about_hi: data.about_hi !== undefined ? data.about_hi : undefined,
                about_mr: data.about_mr !== undefined ? data.about_mr : undefined,
                benefits_en: data.benefits_en ? JSON.parse(data.benefits_en) : (data.benefits ? JSON.parse(data.benefits) : undefined),
                benefits_hi: data.benefits_hi ? JSON.parse(data.benefits_hi) : undefined,
                benefits_mr: data.benefits_mr ? JSON.parse(data.benefits_mr) : undefined,
                bullets_en: data.bullets_en ? JSON.parse(data.bullets_en) : (data.bullets ? JSON.parse(data.bullets) : undefined),
                bullets_hi: data.bullets_hi ? JSON.parse(data.bullets_hi) : undefined,
                bullets_mr: data.bullets_mr ? JSON.parse(data.bullets_mr) : undefined,
                process_en: data.process_en !== undefined ? data.process_en : (data.process !== undefined ? data.process : undefined),
                process_hi: data.process_hi !== undefined ? data.process_hi : undefined,
                process_mr: data.process_mr !== undefined ? data.process_mr : undefined,
                processSteps: data.processSteps ? JSON.parse(data.processSteps) : undefined,
                templeDetails_en: data.templeDetails_en !== undefined ? data.templeDetails_en : (data.templeDetails !== undefined ? data.templeDetails : undefined),
                templeDetails_hi: data.templeDetails_hi !== undefined ? data.templeDetails_hi : undefined,
                templeDetails_mr: data.templeDetails_mr !== undefined ? data.templeDetails_mr : undefined,
                packages: data.packages ? JSON.parse(data.packages) : undefined,
                faqs: data.faqs ? JSON.parse(data.faqs) : undefined,
                status: data.status === 'false' ? false : data.status === 'true' ? true : undefined,
                ...(file && { image: `/uploads/poojas/${file.filename}` })
            }
        });

        res.json({ success: true, data: updatedPooja });
    } catch (error: any) {
        console.error('Update Pooja Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMyPooja = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;

        const pooja = await prisma.pooja.findFirst({
            where: { id: String(id), templeId }
        });

        if (!pooja) {
            return res.status(404).json({ success: false, message: 'Pooja not found or unauthorized' });
        }

        await prisma.pooja.delete({ where: { id: String(id) } });
        res.json({ success: true, message: 'Pooja deleted successfully' });
    } catch (error: any) {
        console.error('Delete Pooja Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const togglePoojaStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;

        const pooja = await prisma.pooja.findFirst({
            where: { id: String(id), templeId }
        });

        if (!pooja) {
            return res.status(404).json({ success: false, message: 'Pooja not found or unauthorized' });
        }

        const updatedPooja = await prisma.pooja.update({
            where: { id: String(id) },
            data: { status: !pooja.status }
        });

        res.json({ success: true, data: updatedPooja });
    } catch (error: any) {
        console.error('Toggle Pooja Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
