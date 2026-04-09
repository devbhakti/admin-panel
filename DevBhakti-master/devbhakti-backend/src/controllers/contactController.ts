import { Request, Response } from 'express';
import { sendEmail } from '../utils/sendEmail';

/**
 * Handle contact form submission
 */
export const submitContact = async (req: Request, res: Response) => {
    try {
        const { name, email, mobile, subject, message } = req.body;

        // Validation
        if (!name || !email || !mobile || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields (Name, Email, Mobile, Subject, Message) are required' 
            });
        }

        // Basic mobile number validation (exactly 10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mobile number must be exactly 10 digits' 
            });
        }

        // Prepare email content for Admin
        const adminEmailSubject = `New Contact Inquiry: ${subject}`;
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #8b4513; border-bottom: 2px solid #8b4513; padding-bottom: 10px;">New Contact Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">This is an automated notification from DevBhakti Portal.</p>
            </div>
        `;

        // Send email to Admin (using the configured MAIL_FROM_ADDRESS as recipient)
        const adminRecipient = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'admin@devbhakti.in';
        await sendEmail(adminRecipient, adminEmailSubject, `New Inquiry from ${name}`, adminEmailHtml);

        // Prepare email content for User (Acknowledgement)
        const userAcknowledgementSubject = `We've received your message - DevBhakti`;
        const userAcknowledgementHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #8b4513; border-bottom: 2px solid #8b4513; padding-bottom: 10px;">Har Om, ${name}!</h2>
                <p>Thank you for reaching out to **DevBhakti**. We have received your inquiry regarding "<strong>${subject}</strong>".</p>
                <p>Our team will review your message and get back to you shortly.</p>
                <p>If you have any urgent queries, please feel free to reply to this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Best Regards,</p>
                <p><strong>Team DevBhakti</strong></p>
            </div>
        `;

        // Send acknowledgement email to User
        await sendEmail(email, userAcknowledgementSubject, `Thank you for contacting DevBhakti, ${name}!`, userAcknowledgementHtml);

        return res.status(200).json({
            success: true,
            message: 'Your inquiry has been submitted successfully'
        });

    } catch (error: any) {
        console.error('Contact submit error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error while submitting contact form' 
        });
    }
};
