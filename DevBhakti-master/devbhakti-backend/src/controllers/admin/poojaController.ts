import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getAllPoojas = async (req: Request, res: Response) => {
    try {
        const { isMaster, templeId, search, poojaId } = req.query;

        const where: any = {};
        if (poojaId) {
            where.id = String(poojaId);
        }
        if (isMaster !== undefined) {
            where.isMaster = isMaster === 'true';
        }
        if (templeId) {
            where.templeId = String(templeId);
        }
        if (search) {
            where.OR = [
                { name_en: { contains: String(search), mode: 'insensitive' } },
                { category_en: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        const poojas = await prisma.pooja.findMany({
            where,
            include: {
                temple: {
                    select: {
                        name_en: true, name_hi: true, name_mr: true
                    }
                },
                masterPooja: {
                    select: {
                        name_en: true, name_hi: true, name_mr: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(poojas);
    } catch (error) {
        console.error('Fetch poojas error:', error);
        res.status(500).json({ error: 'Failed to fetch poojas' });
    }
};

export const createPooja = async (req: Request, res: Response) => {
    try {
        console.log('=== CREATE POOJA DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        const {
            name_en, name_hi, name_mr,
            category_en, category_hi, category_mr,
            price,
            duration_en, duration_hi, duration_mr,
            description_en, description_hi, description_mr,
            time,
            about_en, about_hi, about_mr,
            benefits_en, benefits_hi, benefits_mr,
            bullets_en, bullets_hi, bullets_mr,
            process_en, process_hi, process_mr,
            processSteps,
            templeId,
            packages,
            faqs,
            isMaster,
            masterPoojaId,
            templeDetails_en, templeDetails_hi, templeDetails_mr
        } = req.body;

        // Validate temple exists if provided
        if (templeId && templeId !== 'null' && templeId !== 'undefined') {
            const temple = await prisma.temple.findUnique({
                where: { id: String(templeId) }
            });

            if (!temple) {
                return res.status(400).json({ error: 'Invalid templeId: Temple does not exist' });
            }
        }

        // Handle image path
        let imagePath = '';
        if (req.file) {
            imagePath = `/uploads/poojas/${req.file.filename}`;
        }

        const pooja = await prisma.pooja.create({
            data: {
                name_en: name_en || req.body.name, // Fallback for old frontend
                name_hi,
                name_mr,
                category_en: category_en || req.body.category,
                category_hi,
                category_mr,
                price: parseFloat(price),
                duration_en: duration_en || req.body.duration,
                duration_hi,
                duration_mr,
                description_en: typeof description_en === 'string' ? JSON.parse(description_en) : (description_en || (typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description) || []),
                description_hi: typeof description_hi === 'string' ? JSON.parse(description_hi) : (description_hi || []),
                description_mr: typeof description_mr === 'string' ? JSON.parse(description_mr) : (description_mr || []),
                time,
                image: imagePath,
                about_en: about_en || req.body.about,
                about_hi,
                about_mr,
                benefits_en: typeof benefits_en === 'string' ? JSON.parse(benefits_en) : (benefits_en || (typeof req.body.benefits === 'string' ? JSON.parse(req.body.benefits) : req.body.benefits) || []),
                benefits_hi: typeof benefits_hi === 'string' ? JSON.parse(benefits_hi) : (benefits_hi || []),
                benefits_mr: typeof benefits_mr === 'string' ? JSON.parse(benefits_mr) : (benefits_mr || []),
                bullets_en: typeof bullets_en === 'string' ? JSON.parse(bullets_en) : (bullets_en || (typeof req.body.bullets === 'string' ? JSON.parse(req.body.bullets) : req.body.bullets) || []),
                bullets_hi: typeof bullets_hi === 'string' ? JSON.parse(bullets_hi) : (bullets_hi || []),
                bullets_mr: typeof bullets_mr === 'string' ? JSON.parse(bullets_mr) : (bullets_mr || []),
                process_en: process_en || req.body.process,
                process_hi,
                process_mr,
                processSteps: typeof processSteps === 'string' ? JSON.parse(processSteps) : processSteps,
                templeDetails_en: templeDetails_en || req.body.templeDetails,
                templeDetails_hi,
                templeDetails_mr,
                templeId: (templeId && templeId !== 'null') ? String(templeId) : null,
                isMaster: isMaster === 'true' || isMaster === true,
                masterPoojaId: masterPoojaId || null,
                packages: typeof packages === 'string' ? JSON.parse(packages) : packages,
                faqs: typeof faqs === 'string' ? JSON.parse(faqs) : faqs
            }
        });

        res.status(201).json(pooja);
    } catch (error) {
        console.error('Create pooja error:', error);
        res.status(500).json({ error: 'Failed to create pooja' });
    }
};

export const updatePooja = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name_en, name_hi, name_mr,
            category_en, category_hi, category_mr,
            price,
            duration_en, duration_hi, duration_mr,
            description_en, description_hi, description_mr,
            time,
            about_en, about_hi, about_mr,
            benefits_en, benefits_hi, benefits_mr,
            bullets_en, bullets_hi, bullets_mr,
            process_en, process_hi, process_mr,
            processSteps,
            templeId,
            packages,
            faqs,
            templeDetails_en, templeDetails_hi, templeDetails_mr
        } = req.body;

        // Validate temple exists if templeId is provided
        if (templeId) {
            const temple = await prisma.temple.findUnique({
                where: { id: String(templeId) }
            });

            if (!temple) {
                return res.status(400).json({ error: 'Invalid templeId: Temple does not exist' });
            }
        }

        // Handle localized fields
        let updateData: any = {
            name_en: name_en || req.body.name,
            name_hi,
            name_mr,
            category_en: category_en || req.body.category,
            category_hi,
            category_mr,
            price: price ? parseFloat(price) : undefined,
            duration_en: duration_en || req.body.duration,
            duration_hi,
            duration_mr,
            time,
            about_en: about_en || req.body.about,
            about_hi,
            about_mr,
            process_en: process_en || req.body.process,
            process_hi,
            process_mr,
            processSteps: typeof processSteps === 'string' ? JSON.parse(processSteps) : processSteps,
            templeDetails_en: templeDetails_en || req.body.templeDetails,
            templeDetails_hi,
            templeDetails_mr,
            templeId: (templeId && templeId !== 'null') ? String(templeId) : undefined,
            packages: typeof packages === 'string' ? JSON.parse(packages) : packages,
            faqs: typeof faqs === 'string' ? JSON.parse(faqs) : faqs
        };

        // Handle Array Fields
        if (description_en || req.body.description) {
            updateData.description_en = typeof description_en === 'string' ? JSON.parse(description_en) : (description_en || (typeof req.body.description === 'string' ? JSON.parse(req.body.description) : req.body.description));
        }
        if (description_hi) updateData.description_hi = typeof description_hi === 'string' ? JSON.parse(description_hi) : description_hi;
        if (description_mr) updateData.description_mr = typeof description_mr === 'string' ? JSON.parse(description_mr) : description_mr;

        if (benefits_en || req.body.benefits) {
            updateData.benefits_en = typeof benefits_en === 'string' ? JSON.parse(benefits_en) : (benefits_en || (typeof req.body.benefits === 'string' ? JSON.parse(req.body.benefits) : req.body.benefits));
        }
        if (benefits_hi) updateData.benefits_hi = typeof benefits_hi === 'string' ? JSON.parse(benefits_hi) : benefits_hi;
        if (benefits_mr) updateData.benefits_mr = typeof benefits_mr === 'string' ? JSON.parse(benefits_mr) : benefits_mr;

        if (bullets_en || req.body.bullets) {
            updateData.bullets_en = typeof bullets_en === 'string' ? JSON.parse(bullets_en) : (bullets_en || (typeof req.body.bullets === 'string' ? JSON.parse(req.body.bullets) : req.body.bullets));
        }
        if (bullets_hi) updateData.bullets_hi = typeof bullets_hi === 'string' ? JSON.parse(bullets_hi) : bullets_hi;
        if (bullets_mr) updateData.bullets_mr = typeof bullets_mr === 'string' ? JSON.parse(bullets_mr) : bullets_mr;

        if (req.body.isMaster !== undefined) {
            updateData.isMaster = req.body.isMaster === 'true' || req.body.isMaster === true;
        }

        if (req.file) {
            updateData.image = `/uploads/poojas/${req.file.filename}`;
        }

        const pooja = await prisma.pooja.update({
            where: { id: String(id) },
            data: updateData
        });

        res.json(pooja);
    } catch (error) {
        console.error('Update pooja error:', error);
        res.status(500).json({ error: 'Failed to update pooja' });
    }
};

export const deletePooja = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.pooja.delete({
            where: { id: String(id) }
        });
        res.json({ message: 'Pooja deleted successfully' });
    } catch (error) {
        console.error('Delete pooja error:', error);
        res.status(500).json({ error: 'Failed to delete pooja' });
    }
};

/**
 * Promote a Temple Pooja to a Master Pooja template
 */
export const promoteToMaster = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const templePooja = await prisma.pooja.findUnique({
            where: { id: String(id) }
        });

        if (!templePooja) {
            return res.status(404).json({ error: 'Pooja not found' });
        }

        const masterPooja = await prisma.pooja.create({
            data: {
                name_en: (templePooja as any).name_en,
                name_hi: (templePooja as any).name_hi,
                name_mr: (templePooja as any).name_mr,
                category_en: (templePooja as any).category_en,
                category_hi: (templePooja as any).category_hi,
                category_mr: (templePooja as any).category_mr,
                price: templePooja.price,
                duration_en: (templePooja as any).duration_en,
                duration_hi: (templePooja as any).duration_hi,
                duration_mr: (templePooja as any).duration_mr,
                description_en: (templePooja as any).description_en as string[],
                description_hi: (templePooja as any).description_hi as string[],
                description_mr: (templePooja as any).description_mr as string[],
                time: templePooja.time,
                image: templePooja.image,
                about_en: (templePooja as any).about_en,
                about_hi: (templePooja as any).about_hi,
                about_mr: (templePooja as any).about_mr,
                benefits_en: (templePooja as any).benefits_en as string[],
                benefits_hi: (templePooja as any).benefits_hi as string[],
                benefits_mr: (templePooja as any).benefits_mr as string[],
                bullets_en: (templePooja as any).bullets_en as string[],
                bullets_hi: (templePooja as any).bullets_hi as string[],
                bullets_mr: (templePooja as any).bullets_mr as string[],
                process_en: (templePooja as any).process_en,
                process_hi: (templePooja as any).process_hi,
                process_mr: (templePooja as any).process_mr,
                processSteps: templePooja.processSteps || undefined,
                templeDetails_en: (templePooja as any).templeDetails_en,
                templeDetails_hi: (templePooja as any).templeDetails_hi,
                templeDetails_mr: (templePooja as any).templeDetails_mr,
                templeId: null, // Master poojas don't belong to a temple
                isMaster: true,
                packages: templePooja.packages || undefined,
                faqs: templePooja.faqs || undefined
            }
        });

        // Update the original temple pooja to link it to this master
        await prisma.pooja.update({
            where: { id: String(id) },
            data: {
                masterPoojaId: masterPooja.id
            }
        });

        res.json({
            message: 'Pooja promoted to Master template successfully',
            masterPooja
        });
    } catch (error) {
        console.error('Promote pooja error:', error);
        res.status(500).json({ error: 'Failed to promote pooja' });
    }
};

// Toggle Pooja Status (active/inactive)
export const togglePoojaStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const pooja = await prisma.pooja.findUnique({
            where: { id: String(id) }
        });

        if (!pooja) {
            return res.status(404).json({ success: false, message: 'Pooja not found' });
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
