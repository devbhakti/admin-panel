import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { buildLangJson } from '../utils/localization';

// Create a new Mandal Registration
export const registerMandal = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            // English fields (primary)
            name, name_en, name_hi, name_mr,
            mandalType,
            description, description_en, description_hi, description_mr,
            presiding_deity,
            festivals,
            address,
            city,
            state,
            pinCode,
            contactNumber,
            email,
            presidentName,
            registrationNumber,
            verificationDocUrl,
            presidentIdDocUrl
        } = req.body;

        const nameEn = name_en || name;

        if (!nameEn || !contactNumber) {
            res.status(400).json({ success: false, message: 'Name and contact number are required' });
            return;
        }

        // Check if registration is enabled globally
        const settingsKey = 'mandal_registration_enabled';
        const setting = await prisma.globalSetting.findUnique({
            where: { key: settingsKey }
        });

        const isEnabled = setting ? (setting.value as any)?.enabled : false;

        if (!isEnabled) {
            res.status(403).json({ success: false, message: 'Mandal registration is currently disabled by admin.' });
            return;
        }

        const mandal = await prisma.mandal.create({
            data: {
                name: JSON.stringify(buildLangJson(nameEn, name_hi, name_mr)),
                description: description_en || description || description_hi || description_mr
                    ? JSON.stringify(buildLangJson(description_en || description, description_hi, description_mr))
                    : undefined,
                mandalType,
                presiding_deity,
                festivals,
                address,
                city,
                state,
                pinCode,
                contactNumber,
                email,
                presidentName,
                registrationNumber,
                verificationDocUrl,
                presidentIdDocUrl,
                status: 'PENDING',
                isActive: false,
            }
        });

        res.status(201).json({
            success: true,
            message: 'Mandal registration submitted successfully and is pending approval.',
            mandal
        });
    } catch (error: any) {
        console.error('Error registering mandal:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting mandal registration', error: error.message });
    }
};
