
export interface DonationReceiptData {
    id: string;
    donorName: string;
    donorPhone: string;
    donorEmail: string;
    amount: number;
    status: string;
    createdAt: Date | string;
    paymentMethod: string;
    panNumber?: string;
    address?: string;
    message?: string;
    templeName?: string;
    displayId?: string;
    commissionAmount?: number;
}

export const generateReceiptHTML = (donation: DonationReceiptData) => {
    const date = new Date(donation.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; color: #333; line-height: 1.6; padding: 40px; }
                .receipt-container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px; }
                .header { text-align: center; border-bottom: 2px solid #7c4624; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #7c4624; }
                .temple-name { font-size: 20px; color: #555; margin-top: 5px; }
                .receipt-title { font-size: 24px; font-weight: bold; margin: 20px 0; text-transform: uppercase; color: #7c4624; }
                .section { margin-bottom: 25px; }
                .section-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #7c4624; }
                .grid { display: block; margin-bottom: 10px; }
                 table { width: 100%; }
                .item { margin-bottom: 10px; }
                .label { color: #666; font-size: 14px; }
                .value { font-weight: 500; font-size: 16px; }
                .amount-box { background: #fdf6f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px solid #7c4624; }
                .amount-label { font-size: 14px; color: #7c4624; text-transform: uppercase; letter-spacing: 1px; }
                .amount-value { font-size: 32px; font-weight: bold; color: #7c4624; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="logo">DEV BHAKTI</div>
                    <div class="temple-name">${donation.templeName || "Sacred Temple Offering"}</div>
                </div>

                <div style="text-align: center;">
                    <div class="receipt-title">Donation Receipt</div>
                </div>

                <div class="section">
                    <div class="section-title">Donation Details</div>
                    <table>
                        <tr>
                            <td width="50%">
                                <div class="label">Receipt Number</div>
                                <div class="value">${donation.displayId || donation.id}</div>
                            </td>
                            <td width="50%">
                                <div class="label">Date</div>
                                <div class="value">${date}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="label">Payment Status</div>
                                <div class="value" style="color: green;">${donation.status}</div>
                            </td>
                            <td>
                                <div class="label">Payment Method</div>
                                <div class="value">${donation.paymentMethod || "Razorpay"}</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Donor Information</div>
                    <table>
                        <tr>
                            <td width="50%">
                                <div class="label">Name</div>
                                <div class="value">${donation.donorName}</div>
                            </td>
                            <td width="50%">
                                <div class="label">Phone</div>
                                <div class="value">${donation.donorPhone}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="label">Email</div>
                                <div class="value">${donation.donorEmail}</div>
                            </td>
                            <td>
                                ${donation.panNumber ? `
                                <div class="label">PAN Number</div>
                                <div class="value">${donation.panNumber}</div>` : ''}
                            </td>
                        </tr>
                    </table>
                    ${donation.address ? `
                    <div class="item" style="margin-top: 10px;">
                        <div class="label">Address</div>
                        <div class="value">${donation.address}</div>
                    </div>` : ''}
                </div>

                <div class="amount-box">
                    <div class="amount-label">Contribution to Temple</div>
                    <div class="amount-value">₹ ${donation.amount.toLocaleString('en-IN')}</div>
                    ${donation.commissionAmount && donation.commissionAmount > 0 ? `
                    <div style="margin-top: 15px; border-top: 1px dashed #7c4624; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
                            <span>Platform Support Fee:</span>
                            <span>₹ ${donation.commissionAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px;">
                            <span>Total Amount Paid:</span>
                            <span>₹ ${(donation.amount + donation.commissionAmount).toLocaleString('en-IN')}</span>
                        </div>
                    </div>` : ''}
                    <div style="margin-top: 15px; font-size: 14px; font-style: italic; color: #666;">
                        (Rupees ${numberToWords(donation.amount + (donation.commissionAmount || 0))} Only)
                    </div>
                </div>

                ${donation.message ? `
                <div class="section">
                    <div class="section-title">Message / Sankalp</div>
                    <div class="value" style="font-style: italic;">"${donation.message}"</div>
                </div>` : ''}

                <div class="footer">
                    <p>This is a computer-generated receipt and does not require a physical signature.</p>
                    <p>Thank you for your divine contribution. May you be blessed with peace and prosperity.</p>
                    <p>&copy; ${new Date().getFullYear()} Dev Bhakti. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

    const numStr = num.toString();

    if (numStr.length > 9) return 'overflow';

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
