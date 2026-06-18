import { Request, Response } from 'express';
import { PrismaClient, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();



interface LeadMetadata {
    templeName?: string;
    city?: string;
    state?: string;
    pincode?: string;
    address?: string;
    notes?: string;
    [key: string]: any; // For any other dynamic properties
}

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




export const exportLeads = async (req: Request, res: Response) => {
    try {
        const { search, status, source } = req.query;

        let whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { phone: { contains: search as string, mode: 'insensitive' } },
                { name: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'all') {
            whereClause.status = status as LeadStatus;
        }

        if (source && source !== 'all') {
            whereClause.source = source as string;
        }

        // Saare leads fetch karein bina pagination ke
        const leads = await prisma.lead.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        // CSV headers
        const headers = [
            'S.No',
            'Name',
            'Phone',
            'Email',
            'Source',
            'Status',
            'Temple Name',
            'Created Date',
            'City',
            'State',
            'Pincode',
            'Address',
            'Notes'
        ];

        // CSV rows build karein
        const csvRows = [headers.join(',')];

        leads.forEach((lead, index) => {
            // ✅ FIX: Metadata ko type cast karein
            const metadata = lead.metadata as LeadMetadata || {};
            
            // Handle special characters and commas in data
            const escapeCSV = (value: any) => {
                if (value === null || value === undefined) return '""';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return `"${stringValue}"`;
            };

            const row = [
                index + 1,
                escapeCSV(lead.name),
                escapeCSV(lead.phone),
                escapeCSV(lead.email),
                escapeCSV(lead.source),
                escapeCSV(lead.status),
                escapeCSV(metadata.templeName),      // ✅ Fixed
                escapeCSV(new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })),
                escapeCSV(metadata.city),            // ✅ Fixed
                escapeCSV(metadata.state),           // ✅ Fixed
                escapeCSV(metadata.pincode),         // ✅ Fixed
                escapeCSV(metadata.address),         // ✅ Fixed
                escapeCSV(metadata.notes)            // ✅ Fixed
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // UTF-8 BOM add karein for Excel compatibility
        res.send('\uFEFF' + csvString);

    } catch (error: any) {
        console.error('Error exporting leads:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to export leads',
            error: error.message 
        });
    }
};