import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getLang, localize, buildLangJson } from '../../utils/localization';

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        const lang = getLang(req);
        const templeId = req.query.templeId as string;
        const date = req.query.date as string;

        let where: any = {};
        if (search) {
            where.OR = [
                { name: { path: ['en'], string_contains: search } },
                { temple: { name: { path: ['en'], string_contains: search } } }
            ];
        }

        if (templeId) {
            where.templeId = templeId;
        }

        if (date) {
            where.date = date;
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    temple: {
                        select: {
                            id: true,
                            name: true,
                            location: true
                        }
                    },
                    Pooja: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            duration: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.event.count({ where })
        ]);

        res.json({
            success: true,
            data: localize(events, lang),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
};

// Get event by ID (Raw for Admin)
export const getEventById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({
            where: { id: String(id) },
            include: {
                temple: true,
                Pooja: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
};


// Get events by temple
export const getEventsByTemple = async (req: Request, res: Response) => {
    try {
        const { templeId } = req.params;
        const events = await prisma.event.findMany({
            where: { templeId: String(templeId) },
            orderBy: {
                date: 'asc'
            }
        });
        const lang = getLang(req);
        res.json(localize(events, lang));
    } catch (error) {
        console.error('Error fetching temple events:', error);
        res.status(500).json({ error: 'Failed to fetch temple events' });
    }
};

// Create event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const { 
            name_en, name_hi, name_mr,
            date, time, 
            description_en, description_hi, description_mr,
            templeId, recommendedPoojaIds 
        } = req.body;

        const final_name_en = name_en || req.body.name;

        if (!final_name_en || !date) {
            return res.status(400).json({ error: 'Name (English) and date are required' });
        }

        const event = await prisma.event.create({
            data: {
                name: buildLangJson(name_en || req.body.name, name_hi, name_mr),
                date,
                time: time || null,
                description: buildLangJson(description_en || req.body.description, description_hi, description_mr),
                templeId: templeId || null,
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
                temple: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                },
                Pooja: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        image: true
                    }
                }
            }
        });

        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            name_en, name_hi, name_mr,
            date, time, 
            description_en, description_hi, description_mr,
            templeId, recommendedPoojaIds 
        } = req.body;

        const event = await prisma.event.update({
            where: { id: String(id) },
            data: {
                name: buildLangJson(name_en || req.body.name, name_hi, name_mr),
                date,
                time: time !== undefined ? time : undefined,
                description: buildLangJson(description_en || req.body.description, description_hi, description_mr),
                status: req.body.status !== undefined ? req.body.status : undefined,
                templeId: templeId || null,
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
                temple: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                },
                Pooja: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        duration: true,
                        image: true
                    }
                }
            }
        });

        res.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.event.delete({
            where: { id: String(id) }
        });

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Toggle event status
export const toggleEventStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const event = await prisma.event.update({
            where: { id: String(id) },
            data: { status }
        });

        res.json({ success: true, message: `Event ${status ? 'activated' : 'deactivated'} successfully`, data: event });
    } catch (error) {
        console.error('Error toggling event status:', error);
        res.status(500).json({ success: false, error: 'Failed to toggle event status' });
    }
};
