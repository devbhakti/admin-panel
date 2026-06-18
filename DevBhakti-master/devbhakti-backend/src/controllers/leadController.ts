import { Request, Response } from 'express';
import { PrismaClient, LeadSource } from '@prisma/client';
import { notifyAdmins } from '../services/firebaseService';

const prisma = new PrismaClient();

export const captureLead = async (req: Request, res: Response) => {
  try {
    const { phone, source, metadata, name, email } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Check if lead already exists with this phone
    let lead = await prisma.lead.findUnique({
      where: { phone },
    });

    if (lead) {
      // Update existing lead (maybe add metadata)
      lead = await prisma.lead.update({
        where: { phone },
        data: {
          name: name || lead.name,
          email: email || lead.email,
          source: source || lead.source,
          metadata: metadata ? { ...(lead.metadata as object), ...metadata } : lead.metadata,
        },
      });
    } else {
      // Create new lead
      lead = await prisma.lead.create({
        data: {
          phone,
          name: name || undefined,
          email: email || undefined,
          source: source || 'TEMPLE_ONBOARDING',
          metadata: metadata || {},
        },
      });

      // Notify Admins about the new lead
      try {
        await notifyAdmins({
          title: '🚨 New Lead Captured!',
          body: `A new lead (${phone}) has been captured from ${source || 'TEMPLE_ONBOARDING'}.`,
          data: {
            link: '/admin/leads',
            type: 'NEW_LEAD'
          }
        });
      } catch (notifyErr) {
        console.error("Failed to notify admins for new lead:", notifyErr);
      }
    }

    return res.status(200).json({ success: true, lead });
  } catch (error: any) {
    console.error('Error capturing lead:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
