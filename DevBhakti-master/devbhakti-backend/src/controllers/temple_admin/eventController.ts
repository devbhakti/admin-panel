import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getMyEvents = async (req: Request, res: Response) => {
    try {
        const templeId = (req as any).owner.ownerId;

        const events = await prisma.event.findMany({
            where: { templeId },
            include: {
                Pooja: {
                    select: {
                        id: true,
                        name_en: true,
                        name_hi: true,
                        name_mr: true,
                        price: true,
                        duration_en: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: events });
    } catch (error: any) {
        console.error('Fetch Events Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createMyEvent = async (req: Request, res: Response) => {
    try {
        const templeId = (req as any).owner.ownerId;
        const data = req.body;

        // Extract recommended pooja IDs
        const { recommendedPoojaIds, ...eventData } = data;

        const event = await prisma.event.create({
            data: {
                name_en: eventData.name_en || eventData.name,
                name_hi: eventData.name_hi || null,
                name_mr: eventData.name_mr || null,
                date: eventData.date,
                time: eventData.time || null,
                description_en: eventData.description_en || eventData.description || '',
                description_hi: eventData.description_hi || null,
                description_mr: eventData.description_mr || null,
                templeId: templeId,
                status: eventData.status === false ? false : true,
                // Connect recommended poojas if provided
                ...(recommendedPoojaIds && recommendedPoojaIds.length > 0
                    ? {
                        Pooja: {
                            connect: recommendedPoojaIds.map((id: string) => ({ id }))
                        }
                    }
                    : {})
            },
            include: {
                Pooja: {
                    select: {
                        id: true,
                        name_en: true,
                        price: true,
                        duration_en: true,
                        image: true
                    }
                }
            }
        });

        res.status(201).json({ success: true, data: event });
    } catch (error: any) {
        console.error('Create Event Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMyEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;
        const data = req.body;

        const existingEvent = await prisma.event.findFirst({
            where: { id: String(id), templeId }
        });

        if (!existingEvent) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }

        // Extract recommended pooja IDs
        const { recommendedPoojaIds, ...eventData } = data;

        const updatedEvent = await prisma.event.update({
            where: { id: String(id) },
            data: {
                name_en: eventData.name_en || (eventData.name !== undefined ? eventData.name : undefined),
                name_hi: eventData.name_hi !== undefined ? eventData.name_hi : undefined,
                name_mr: eventData.name_mr !== undefined ? eventData.name_mr : undefined,
                date: eventData.date,
                time: eventData.time !== undefined ? eventData.time : undefined,
                description_en: eventData.description_en || (eventData.description !== undefined ? eventData.description : undefined),
                description_hi: eventData.description_hi !== undefined ? eventData.description_hi : undefined,
                description_mr: eventData.description_mr !== undefined ? eventData.description_mr : undefined,
                status: eventData.status !== undefined ? eventData.status : undefined,
                // Sync recommended poojas if provided
                ...(recommendedPoojaIds !== undefined
                    ? {
                        Pooja: {
                            set: recommendedPoojaIds.map((poojaId: string) => ({ id: poojaId }))
                        }
                    }
                    : {})
            },
            include: {
                Pooja: {
                    select: {
                        id: true,
                        name_en: true,
                        price: true,
                        duration_en: true,
                        image: true
                    }
                }
            }
        });

        res.json({ success: true, data: updatedEvent });
    } catch (error: any) {
        console.error('Update Event Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMyEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;

        const event = await prisma.event.findFirst({
            where: { id: String(id), templeId }
        });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }

        await prisma.event.delete({ where: { id: String(id) } });
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleEventStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const templeId = (req as any).owner.ownerId;

        const event = await prisma.event.findFirst({
            where: { id: String(id), templeId }
        });

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: String(id) },
            data: { status: !event.status }
        });

        res.json({ success: true, data: updatedEvent });
    } catch (error: any) {
        console.error('Toggle Event Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
