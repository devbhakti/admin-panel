

import { sendEmail } from '../utils/sendEmail';

export interface BookingMailData {
    bookingId: string;
    devoteeName: string;
    devoteePhone: string;
    devoteeEmail?: string;
    poojaName: string;
    templeName: string;
    bookingDate: string;
    packageName: string;
    packagePrice: number;
    platformFee: number;
    totalAmount: number;
    status: string;
    createdAt?: string;
    gothra?: string;
    kuldevi?: string;
    kuldevta?: string;
    dob?: string;
    anniversary?: string;
    additionalDevotees?: { name: string; gothra: string; kuldevi: string; kuldevta: string }[];
}

const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

    const numStr = Math.floor(num).toString();
    if (numStr.length > 9) return 'Amount too large';

    const n = ('000000000' + numStr)
        .slice(-9)
        .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);

    if (!n) return '';

    let str = '';
    str += n[1] !== '00' ? (a[+n[1]] || (b[+n[1][0]] + a[+n[1][1]])) + 'Crore ' : '';
    str += n[2] !== '00' ? (a[+n[2]] || (b[+n[2][0]] + a[+n[2][1]])) + 'Lakh ' : '';
    str += n[3] !== '00' ? (a[+n[3]] || (b[+n[3][0]] + a[+n[3][1]])) + 'Thousand ' : '';
    str += n[4] !== '0' ? (a[+n[4]] || (b[+n[4][0]] + a[+n[4][1]])) + 'Hundred ' : '';
    str += n[5] !== '00'
        ? ((str !== '') ? 'and ' : '') + (a[+n[5]] || (b[+n[5][0]] + a[+n[5][1]]))
        : '';

    return str.trim();
};

export const sendBookingReceiptEmail = async (data: BookingMailData) => {
    if (!data.devoteeEmail) return;

    const bookingDateFormatted = data.bookingDate;
    const amountInWords = numberToWords(data.totalAmount);
    const generatedDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }) : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const additionalDevoteesHtml = data.additionalDevotees && data.additionalDevotees.length > 0 && data.additionalDevotees.some(d => d.name)
        ? `
        <div style="margin-top: 25px; border-top: 2px solid #7c4624; padding-top: 15px;">
            <div style="font-family: 'Playfair Display', serif; color: #7c4624; font-weight: bold; margin-bottom: 15px; font-size: 18px;">Additional Devotee Details</div>
            ${data.additionalDevotees
            .filter(d => d.name)
            .map((d, i) => `
                <div style="background: #fdf6f0; border: 1px solid #dcb386; padding: 15px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-family: 'Playfair Display', serif; color: #5d2e0b; font-weight: bold; font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid #e0c0a8; padding-bottom: 5px;">Devotee #${i + 2}: ${d.name}</div>
                    <table width="100%" cellspacing="0" cellpadding="0" style="font-family: 'Lato', sans-serif; font-size: 14px; color: #555;">
                        <tr>
                            <td style="padding: 2px 0; width: 50%;">${d.gothra ? `<span style="color:#777; font-weight:600;">Gothra:</span> ${d.gothra}` : ''}</td>
                            <td style="padding: 2px 0;">${d.kuldevi ? `<span style="color:#777; font-weight:600;">Kuldevi:</span> ${d.kuldevi}` : ''}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 2px 0;">${d.kuldevta ? `<span style="color:#777; font-weight:600;">Kuldevta:</span> ${d.kuldevta}` : ''}</td>
                        </tr>
                    </table>
                </div>
            `).join('')}
        </div>
        `
        : '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Lato', sans-serif; color: #333; line-height: 1.5; padding: 20px; background-color: #f4f4f4; margin: 0; }
                .container { background-color: #ffffff; width: 100%; max-width: 600px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 4px; margin: 0 auto; }
                
                .header { text-align: center; border-bottom: 2px solid #7c4624; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { font-family: 'Playfair Display', serif; font-size: 32px; letter-spacing: 3px; color: #5d2e0b; margin: 0; text-transform: uppercase; }
                .header p { font-size: 15px; color: #666; margin-top: 8px; font-weight: 500; }
                
                .section { margin-bottom: 25px; }
                .section-title { font-family: 'Playfair Display', serif; font-size: 18px; color: #7c4624; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; margin-bottom: 15px; font-weight: 700; }
                
                .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                .label { color: #777; font-weight: 600; width: 40%; }
                .value { color: #222; font-weight: 400; width: 58%; text-align: right; word-break: break-word; }
                
                .amount-box { background-color: #fdf6f0; border: 1px dashed #dcb386; padding: 20px; text-align: center; border-radius: 6px; margin-top: 30px; margin-bottom: 10px; }
                .amount-label { font-size: 14px; color: #7c4624; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                .amount-value { font-family: 'Playfair Display', serif; font-size: 28px; color: #333; font-weight: 700; margin-bottom: 5px; }
                .amount-words { font-size: 13px; color: #666; font-style: italic; }
                
                .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
                
                .quote-box { margin-top: 25px; text-align: center; background: #fdf6f0; padding: 12px; border-radius: 4px; border-left: 4px solid #7c4624; }
                .quote-box p { font-size: 13px; font-style: italic; color: #7c4624; margin: 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DEV BHAKTI</h1>
                    <p>Sacred Pooja Booking Receipt</p>
                </div>
                <div class="content">
                    
                    <!-- Booking Information Section -->
                    <div class="section">
                        <div class="section-title">Booking Information</div>
                        
                        <!-- Booking ID Uncommented -->
                     <!--   <div class="info-row">
                            <span class="label">Booking ID</span>
                            <span class="value">${data.bookingId}</span>
                        </div> -->

                        <div class="info-row">
                            <span class="label">Temple</span>
                            <span class="value">${data.templeName}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Pooja Service</span>
                            <span class="value">${data.poojaName}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Package</span>
                            <span class="value">${data.packageName}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Pooja Date</span>
                            <span class="value">${bookingDateFormatted}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Generated On</span>
                            <span class="value">${generatedDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Status</span>
                            <span class="value" style="color: #2e7d32; font-weight: 700;">${data.status}</span>
                        </div>
                    </div>

                    <!-- Devotee Details Section -->
                    <div class="section">
                        <div class="section-title">Main Devotee Details</div>
                        
                        <div class="info-row">
                            <span class="label">Name</span>
                            <span class="value">${data.devoteeName}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Phone</span>
                            <span class="value">${data.devoteePhone}</span>
                        </div>
                        
                        <!-- Conditional Email -->
                        ${data.devoteeEmail ? `
                        <div class="info-row">
                            <span class="label">Email</span>
                            <span class="value">${data.devoteeEmail}</span>
                        </div>` : ''}
                        
                        <!-- Spiritual Details -->
                        ${data.gothra ? `
                        <div class="info-row">
                            <span class="label">Gothra</span>
                            <span class="value">${data.gothra}</span>
                        </div>` : ''}
                        
                        ${data.kuldevi ? `
                        <div class="info-row">
                            <span class="label">Kuldevi</span>
                            <span class="value">${data.kuldevi}</span>
                        </div>` : ''}
                        
                        ${data.kuldevta ? `
                        <div class="info-row">
                            <span class="label">Kuldevta</span>
                            <span class="value">${data.kuldevta}</span>
                        </div>` : ''}
                        
                        <!-- Personal Dates -->
                        ${data.dob ? `
                        <div class="info-row">
                            <span class="label">Date of Birth</span>
                            <span class="value">${data.dob}</span>
                        </div>` : ''}
                        
                        ${data.anniversary ? `
                        <div class="info-row">
                            <span class="label">Anniversary</span>
                            <span class="value">${data.anniversary}</span>
                        </div>` : ''}
                    </div>

                    ${additionalDevoteesHtml}

                    <!-- Amount Section -->
                    <div class="amount-box">
                        <div class="amount-label">Total Amount Paid</div>
                        <div class="amount-value">₹ ${data.totalAmount.toLocaleString('en-IN')}</div>
                        <div class="amount-words">(Rupees ${amountInWords} Only)</div>
                        <div style="margin-top: 15px; font-size: 12px; color: #8d6e63; border-top: 1px solid #e0c0a8; padding-top: 10px;">
                            Package: ₹${data.packagePrice} &nbsp;|&nbsp; Platform Fee: ₹${data.platformFee}
                        </div>
                    </div>

                    <!-- Quote Section -->
                    <div class="quote-box">
                        <p>
                            "May the divine blessings of ${data.templeName} bring peace, prosperity, and happiness to your life."
                        </p>
                    </div>

                </div>
                <div class="footer">
                    <p>This is a computer-generated confirmation and does not require a physical signature.</p>
                    <p>&copy; ${new Date().getFullYear()} Dev Bhakti. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail(
        data.devoteeEmail,
        `Booking Confirmed: ${data.poojaName} - Dev Bhakti`,
        `Your sacred pooja booking ${data.bookingId} at ${data.templeName} has been confirmed. Total amount paid: ₹${data.totalAmount}.`,
        html
    );
};