import { sendEmail } from '../utils/sendEmail';

export interface DonationMailData {
    donationId: string;
    donorName: string;
    donorPhone: string;
    donorEmail: string;
    templeName: string;
    amount: number;
    status: string;
    createdAt: string;
    isAnonymous: boolean;
    is80GRequired: boolean;
    panNumber?: string;
    address?: string;
    message?: string;
    displayId?: string;
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

export const sendDonationReceiptEmail = async (data: DonationMailData, pdfBuffer: Buffer) => {
    if (!data.donorEmail) return;

    const amountInWords = numberToWords(data.amount);
    const generatedDate = new Date(data.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .header { background: #7c4624; color: white; padding: 40px 20px; text-align: center; }
                .content { padding: 30px; }
                .section { margin-bottom: 25px; }
                .section-title { font-weight: bold; border-bottom: 1px solid #7c462433; padding-bottom: 8px; margin-bottom: 15px; color: #7c4624; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                .label { color: #666; }
                .value { font-weight: 600; color: #333; }
                .amount-box { background: #fdf6f0; border: 1px solid #7c4624; padding: 25px 15px; text-align: center; border-radius: 10px; margin: 30px 0; }
                .amount-label { font-size: 12px; color: #7c4624; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; }
                .amount-value { font-size: 32px; font-weight: bold; color: #7c4624; margin: 5px 0; }
                .amount-words { font-size: 13px; font-style: italic; color: #666; margin-top: 10px; }
                .footer { background: #f9f9f9; padding: 25px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">DEV BHAKTI</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Sacred Donation Receipt</p>
                </div>
                <div class="content">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <p style="font-size: 16px; color: #333;">Jai Siya Ram, <strong>${data.donorName}</strong>!</p>
                        <p style="font-size: 14px; color: #666;">Thank you for your generous contribution to <strong>${data.templeName}</strong>.</p>
                    </div>

                    <div class="section">
                        <div class="section-title">Donation Information</div>
                        <div class="info-row"><span class="label">Receipt ID</span><span class="value">#${data.displayId || data.donationId.slice(0, 8).toUpperCase()}</span></div>
                        <div class="info-row"><span class="label">Temple</span><span class="value">${data.templeName}</span></div>
                        <div class="info-row"><span class="label">Date</span><span class="value">${generatedDate}</span></div>
                        <div class="info-row"><span class="label">Status</span><span class="value" style="color: #2e7d32;">${data.status}</span></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Donor Details</div>
                        <div class="info-row"><span class="label">Name</span><span class="value">${data.isAnonymous ? 'Anonymous' : data.donorName}</span></div>
                        ${!data.isAnonymous ? `
                            <div class="info-row"><span class="label">Phone</span><span class="value">${data.donorPhone}</span></div>
                            <div class="info-row"><span class="label">Email</span><span class="value">${data.donorEmail}</span></div>
                        ` : ''}
                        ${data.panNumber ? `<div class="info-row"><span class="label">PAN Number</span><span class="value">${data.panNumber}</span></div>` : ''}
                    </div>

                    <div class="amount-box">
                        <div class="amount-label">Contribution Amount</div>
                        <div class="amount-value">₹ ${data.amount.toLocaleString('en-IN')}</div>
                        <div class="amount-words">(Rupees ${amountInWords} Only)</div>
                    </div>

                    ${data.message ? `
                        <div style="margin-top: 30px; text-align: center; border-radius: 8px; padding: 15px; border-left: 4px solid #7c4624; background: #fdf6f0;">
                            <p style="margin: 0; font-size: 13px; font-style: italic; color: #7c4624;">
                                "${data.message}"
                            </p>
                        </div>
                    ` : ''}

                    <p style="font-size: 13px; color: #666; margin-top: 30px; text-align: center;">
                        We have attached your official donation receipt (PDF) with this email for your records.
                    </p>
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
        data.donorEmail,
        `Donation Receipt: ${data.templeName} - Dev Bhakti`,
        `Thank you for your generous donation of ₹${data.amount} to ${data.templeName}. Please find your receipt attached.`,
        html,
        [
            {
                filename: `Donation_Receipt_${data.displayId || data.donationId.slice(0, 8)}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    );
};
