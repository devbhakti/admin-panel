import { Request, Response } from 'express';
import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllLeads = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search, status, source } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        let whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { phone: { contains: search as string, mode: 'insensitive' } },
                { name: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'all') {
            whereClause.status = status;
        }

        if (source && source !== 'all') {
            whereClause.source = source;
        }

        const [leads, totalCount] = await Promise.all([
            prisma.lead.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.lead.count({ where: whereClause })
        ]);

        res.json({
            success: true,
            data: {
                leads,
                pagination: {
                    total: totalCount,
                    page: Number(page),
                    limit: take,
                    totalPages: Math.ceil(totalCount / take)
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !Object.values(LeadStatus).includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedLead = await prisma.lead.update({
            where: { id: id as string },
            data: { status }
        });

        res.json({ success: true, message: 'Lead status updated successfully', lead: updatedLead });
    } catch (error: any) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const deleteLead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.lead.delete({
            where: { id: id as string }
        });

        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
