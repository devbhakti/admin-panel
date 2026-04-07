import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Banner Controllers
export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await prisma.banner.findMany({
            where: {
                NOT: { id: "GLOBAL_SECTION_toggle" }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ success: false, message: 'Error fetching banners' });
    }

};

export const createBanner = async (req: Request, res: Response) => {
    try {
        const { link, active, order } = req.body;
        const image = req.file ? `/uploads/cms/banners/${req.file.filename}` : null;


        if (!image) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }


        const banner = await prisma.banner.create({
            data: {
                image,
                link,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.status(201).json({ success: true, message: 'Banner created successfully', data: banner });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ success: false, message: 'Error creating banner' });
    }

};

export const updateBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { link, active, order } = req.body;

        const existingBanner = await prisma.banner.findUnique({ where: { id: id as string } });

        if (!existingBanner) return res.status(404).json({ success: false, message: 'Banner not found' });


        let image = existingBanner.image;
        if (req.file) {
            image = `/uploads/cms/banners/${req.file.filename}`;
        }


        const banner = await prisma.banner.update({
            where: { id: id as string },
            data: {

                image,
                link,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.json({ success: true, message: 'Banner updated successfully', data: banner });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ success: false, message: 'Error updating banner' });
    }

};

export const getBannerGlobalStatus = async (req: Request, res: Response) => {
    try {
        const statusRecord = await prisma.banner.findUnique({
            where: { id: "GLOBAL_SECTION_toggle" }
        });

        res.json({
            success: true,
            active: statusRecord ? statusRecord.active : true // Default to true if not exists
        });
    } catch (error) {
        console.error('Error fetching banner global status:', error);
        res.status(500).json({ success: false, message: 'Error fetching global status' });
    }
};

export const toggleBannerGlobalStatus = async (req: Request, res: Response) => {
    try {
        const statusRecord = await prisma.banner.findUnique({
            where: { id: "GLOBAL_SECTION_toggle" }
        });

        const currentStatus = statusRecord ? statusRecord.active : true;

        const updated = await prisma.banner.upsert({
            where: { id: "GLOBAL_SECTION_toggle" },
            update: { active: !currentStatus },
            create: {
                id: "GLOBAL_SECTION_toggle",
                image: "SYSTEM", // Placeholder
                active: !currentStatus,
                order: -1
            }
        });

        res.json({ success: true, active: updated.active });
    } catch (error) {
        console.error('Error toggling banner global status:', error);
        res.status(500).json({ success: false, message: 'Error toggling global status' });
    }
};

export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.banner.delete({ where: { id: id as string } });
        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ success: false, message: 'Error deleting banner' });
    }

};

// Feature Controllers
export const getFeatures = async (req: Request, res: Response) => {
    try {
        const features = await prisma.feature.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, data: features });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching features' });
    }

};

export const createFeature = async (req: Request, res: Response) => {
    try {
        const { 
            title_en, title_hi, title_mr,
            description_en, description_hi, description_mr,
            active, order 
        } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const image = files['image'] ? `/uploads/cms/features/${files['image'][0].filename}` : null;
        const icon = files['icon'] ? `/uploads/cms/features/${files['icon'][0].filename}` : null;

        const final_title_en = title_en || req.body.title;

        if (!final_title_en || !image || !icon) {
            return res.status(400).json({ success: false, message: 'Title (English), image and icon are required' });
        }


        const feature = await prisma.feature.create({
            data: {
                title_en: final_title_en,
                title_hi: title_hi || null,
                title_mr: title_mr || null,
                description_en: description_en || req.body.description || null,
                description_hi: description_hi || null,
                description_mr: description_mr || null,
                image,
                icon,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.status(201).json({ success: true, message: 'Feature created successfully', data: feature });
    } catch (error) {
        console.error('Error creating feature:', error);
        res.status(500).json({ success: false, message: 'Error creating feature' });
    }

};

export const updateFeature = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            title_en, title_hi, title_mr,
            description_en, description_hi, description_mr,
            active, order 
        } = req.body;

        const existingFeature = await prisma.feature.findUnique({ where: { id: id as string } });

        if (!existingFeature) return res.status(404).json({ success: false, message: 'Feature not found' });


        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        let image = existingFeature.image;
        if (files && files['image']) {
            image = `/uploads/cms/features/${files['image'][0].filename}`;
        }

        let icon = existingFeature.icon;
        if (files && files['icon']) {
            icon = `/uploads/cms/features/${files['icon'][0].filename}`;
        }


        const feature = await prisma.feature.update({
            where: { id: id as string },
            data: {
                title_en: title_en || req.body.title,
                title_hi,
                title_mr,
                description_en: description_en || req.body.description,
                description_hi,
                description_mr,
                image,
                icon,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.json({ success: true, message: 'Feature updated successfully', data: feature });
    } catch (error) {
        console.error('Error updating feature:', error);
        res.status(500).json({ success: false, message: 'Error updating feature' });
    }

};

export const deleteFeature = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.feature.delete({ where: { id: id as string } });
        res.json({ success: true, message: 'Feature deleted successfully' });
    } catch (error) {
        console.error('Error deleting feature:', error);
        res.status(500).json({ success: false, message: 'Error deleting feature' });
    }

};

// Testimonial Controllers
export const getTestimonials = async (req: Request, res: Response) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, data: testimonials });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ success: false, message: 'Error fetching testimonials' });
    }

};

export const createTestimonial = async (req: Request, res: Response) => {
    try {
        const { 
            title_en, title_hi, title_mr,
            subtitle_en, subtitle_hi, subtitle_mr,
            category_en, category_hi, category_mr,
            active, order 
        } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const thumbnail = files['thumbnail'] ? `/uploads/cms/testimonials/${files['thumbnail'][0].filename}` : null;
        const videoSrc = files['videoSrc'] ? `/uploads/cms/testimonials/${files['videoSrc'][0].filename}` : null;

        const final_title_en = title_en || req.body.title;

        if (!final_title_en || !thumbnail || !videoSrc) {
            return res.status(400).json({ success: false, message: 'Title (English), thumbnail and video are required' });
        }


        const testimonial = await prisma.testimonial.create({
            data: {
                title_en: final_title_en,
                title_hi: title_hi || null,
                title_mr: title_mr || null,
                subtitle_en: subtitle_en || req.body.subtitle || null,
                subtitle_hi: subtitle_hi || null,
                subtitle_mr: subtitle_mr || null,
                category_en: category_en || req.body.category || null,
                category_hi: category_hi || null,
                category_mr: category_mr || null,
                thumbnail,
                videoSrc,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.status(201).json({ success: true, message: 'Testimonial created successfully', data: testimonial });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ success: false, message: 'Error creating testimonial' });
    }

};

export const updateTestimonial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            title_en, title_hi, title_mr,
            subtitle_en, subtitle_hi, subtitle_mr,
            category_en, category_hi, category_mr,
            active, order 
        } = req.body;

        const existingTestimonial = await prisma.testimonial.findUnique({ where: { id: id as string } });
        if (!existingTestimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });


        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        let thumbnail = existingTestimonial.thumbnail;
        if (files && files['thumbnail']) {
            thumbnail = `/uploads/cms/testimonials/${files['thumbnail'][0].filename}`;
        }

        let videoSrc = existingTestimonial.videoSrc;
        if (files && files['videoSrc']) {
            videoSrc = `/uploads/cms/testimonials/${files['videoSrc'][0].filename}`;
        }

        const testimonial = await prisma.testimonial.update({
            where: { id: id as string },
            data: {
                title_en: title_en || req.body.title,
                title_hi,
                title_mr,
                subtitle_en: subtitle_en || req.body.subtitle,
                subtitle_hi,
                subtitle_mr,
                category_en: category_en || req.body.category,
                category_hi,
                category_mr,
                thumbnail,
                videoSrc,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.json({ success: true, message: 'Testimonial updated successfully', data: testimonial });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({ success: false, message: 'Error updating testimonial' });
    }

};

export const deleteTestimonial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.testimonial.delete({ where: { id: id as string } });
        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({ success: false, message: 'Error deleting testimonial' });
    }

};

// CTA Card Controllers
export const getCTACards = async (req: Request, res: Response) => {
    try {
        const ctaCards = await prisma.cTACard.findMany({
            orderBy: { order: 'asc' }
        });
        res.json({ success: true, data: ctaCards });
    } catch (error) {
        console.error('Error fetching CTA cards:', error);
        res.status(500).json({ error: 'Failed to fetch CTA cards' });
    }
};

export const createCTACard = async (req: Request, res: Response) => {
    try {
        const { 
            title_en, title_hi, title_mr,
            points_en, points_hi, points_mr,
            buttonText_en, buttonText_hi, buttonText_mr,
            buttonLink, cardType, active, order 
        } = req.body;
        const icon = req.file ? `/uploads/cms/cta/${req.file.filename}` : null;

        const final_title_en = title_en || req.body.title;

        if (!icon) {
            return res.status(400).json({ success: false, message: 'Icon is required' });
        }

        const parsePoints = (p: any) => {
            if (!p) return [];
            if (typeof p === 'string') {
                try {
                    return JSON.parse(p);
                } catch (e) {
                    return [p];
                }
            }
            return p;
        };

        const ctaCard = await prisma.cTACard.create({
            data: {
                title_en: final_title_en,
                title_hi: title_hi || null,
                title_mr: title_mr || null,
                points_en: parsePoints(points_en || req.body.points),
                points_hi: parsePoints(points_hi),
                points_mr: parsePoints(points_mr),
                icon,
                buttonText_en: buttonText_en || req.body.buttonText || "Learn More",
                buttonText_hi: buttonText_hi || null,
                buttonText_mr: buttonText_mr || null,
                buttonLink,
                cardType,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.status(201).json({ success: true, data: ctaCard });
    } catch (error) {
        console.error('Error creating CTA card:', error);
        res.status(500).json({ success: false, message: 'Failed to create CTA card', error: error instanceof Error ? error.message : String(error) });
    }
};

export const updateCTACard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            title_en, title_hi, title_mr,
            points_en, points_hi, points_mr,
            buttonText_en, buttonText_hi, buttonText_mr,
            buttonLink, cardType, active, order 
        } = req.body;

        const existingCard = await prisma.cTACard.findUnique({ where: { id: id as string } });
        if (!existingCard) {
            return res.status(404).json({ success: false, message: 'CTA card not found' });
        }

        let icon = existingCard.icon;
        if (req.file) {
            icon = `/uploads/cms/cta/${req.file.filename}`;
        }

        const parsePoints = (p: any) => {
            if (p === undefined) return undefined;
            if (!p) return [];
            if (typeof p === 'string') {
                try {
                    return JSON.parse(p);
                } catch (e) {
                    return [p];
                }
            }
            return p;
        };

        const ctaCard = await prisma.cTACard.update({
            where: { id: id as string },
            data: {
                title_en: title_en || req.body.title,
                title_hi,
                title_mr,
                points_en: parsePoints(points_en || req.body.points),
                points_hi: parsePoints(points_hi),
                points_mr: parsePoints(points_mr),
                icon,
                buttonText_en: buttonText_en || req.body.buttonText,
                buttonText_hi,
                buttonText_mr,
                buttonLink,
                cardType,
                active: active === 'true' || active === true,
                order: parseInt(order as string) || 0
            }
        });

        res.json({ success: true, data: ctaCard });
    } catch (error) {
        console.error('Error updating CTA card (INTERNAL ERROR):', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update CTA card',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

export const deleteCTACard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existingCard = await prisma.cTACard.findUnique({ where: { id: id as string } });
        if (!existingCard) {
            return res.status(404).json({ error: 'CTA card not found' });
        }

        await prisma.cTACard.delete({ where: { id: id as string } });

        res.json({ success: true, message: 'CTA card deleted successfully' });
    } catch (error) {
        console.error('Error deleting CTA card:', error);
        res.status(500).json({ error: 'Failed to delete CTA card' });
    }
};
