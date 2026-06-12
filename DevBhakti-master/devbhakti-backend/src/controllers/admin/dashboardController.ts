// import { Request, Response } from 'express';
// import { prisma } from '../../lib/prisma';
// import { localize } from '../../utils/localization';

// export const getAdminDashboardStats = async (req: Request, res: Response) => {
//     try {
//         const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

//         // 1. Core Statistics - WITH COMPLETED FILTER
//         const [
//             totalTemples,
//             totalUsers,
//             totalPoojaBookings,
//             totalProductOrders,
//             totalDonations,
//             completedBookingsRevenue,
//             completedOrdersRevenue,
//         ] = await Promise.all([
//             prisma.temple.count(),
//             prisma.user.count({ where: { role: 'DEVOTEE' } }),
//             prisma.poojaBooking.count({ where: { status: { not: 'PENDING' } } }),
//             prisma.order.count(),
//             prisma.donation.count({ where: { status: { in: ['COMPLETED', 'SUCCESS'] } } }),
//             prisma.poojaBooking.aggregate({
//                 where: { status: 'COMPLETED' },
//                 _sum: { packagePrice: true }
//             }),
//             prisma.order.aggregate({
//                 where: { status: 'COMPLETED' },
//                 _sum: { totalAmount: true }
//             })
//         ]);

//         // ✅ FIX: Donations revenue - Raw query with BigInt conversion
//         let completedDonationsRevenue = 0;
//         try {
//             const donationsResult: any = await prisma.$queryRaw`
//                 SELECT SUM(CAST(amount AS INTEGER)) as total 
//                 FROM "Donation" 
//                 WHERE status IN ('COMPLETED', 'SUCCESS')
//             `;
//             completedDonationsRevenue = Number(donationsResult[0]?.total) || 0;
//             console.log('Donations revenue:', completedDonationsRevenue);
//         } catch (error) {
//             console.error('Donations query error:', error);
//         }

//         // ✅ TOTAL REVENUE (All 3 sources) with proper Number conversion
//         const totalRevenue = 
//             Number(completedBookingsRevenue._sum.packagePrice || 0) + 
//             Number(completedOrdersRevenue._sum.totalAmount || 0) + 
//             completedDonationsRevenue;

//         // Revenue Breakdown
//         const revenueBreakdown = {
//             bookings: Number(completedBookingsRevenue._sum.packagePrice || 0),
//             orders: Number(completedOrdersRevenue._sum.totalAmount || 0),
//             donations: completedDonationsRevenue
//         };

//         console.log('📊 Revenue Debug:', revenueBreakdown, 'Total:', totalRevenue);

//         // 2. Pending Approvals
//         const [pendingTemples, pendingProducts, pendingWithdrawals, pendingPoojas] = await Promise.all([
//             prisma.user.count({
//                 where: {
//                     role: 'INSTITUTION',
//                     isVerified: false
//                 }
//             }),
//             prisma.product.count({ where: { status: 'pending' } }),
//             prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
//             prisma.pooja.count({ where: { status: false } })
//         ]);

//         // 3. Recent Activity (Combined)
//         const [recentBookings, recentUsers, recentTemples] = await Promise.all([
//             prisma.poojaBooking.findMany({
//                 where: { status: 'COMPLETED' },
//                 take: 5,
//                 orderBy: { createdAt: 'desc' },
//                 include: { pooja: true, temple: true }
//             }),
//             prisma.user.findMany({
//                 take: 5,
//                 where: { role: 'DEVOTEE' },
//                 orderBy: { createdAt: 'desc' }
//             }),
//             prisma.temple.findMany({
//                 take: 5,
//                 orderBy: { createdAt: 'desc' }
//             })
//         ]);

//         // Format activities
//         const activities: any[] = [
//             ...recentBookings.map(b => {
//                 const lp = localize(b.pooja, lang);
//                 const lt = b.temple ? localize(b.temple, lang) : null;
//                 return {
//                     id: b.id,
//                     type: 'booking',
//                     title: `New booking for ${lp.name || 'Pooja'}`,
//                     description: `At ${lt?.name || 'Platform'} • ₹${b.packagePrice}`,
//                     time: b.createdAt
//                 };
//             }),
//             ...recentUsers.map(u => ({
//                 id: u.id,
//                 type: 'user',
//                 title: `New user registration`,
//                 description: u.name || u.phone || 'Anonymous',
//                 time: u.createdAt
//             })),
//             ...recentTemples.map(t => {
//                 const lt = localize(t, lang);
//                 return {
//                     id: t.id,
//                     type: 'temple',
//                     title: `New temple registered`,
//                     description: lt.name,
//                     time: t.createdAt
//                 };
//             })
//         ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

//         // 4. Pending Items List for UI - Mixed types
//         const [pTemples, pProducts, pWithdrawals, pPoojas] = await Promise.all([
//             prisma.temple.findMany({
//                 where: { user: { role: 'INSTITUTION', isVerified: false } },
//                 take: 2,
//                 orderBy: { createdAt: 'desc' }
//             }),
//             prisma.product.findMany({
//                 where: { status: 'pending' },
//                 take: 2,
//                 orderBy: { createdAt: 'desc' }
//             }),
//             prisma.withdrawalRequest.findMany({
//                 where: { status: 'PENDING' },
//                 take: 2,
//                 include: { temple: true, seller: true },
//                 orderBy: { createdAt: 'desc' }
//             }),
//             prisma.pooja.findMany({
//                 where: { status: false },
//                 take: 2,
//                 include: { temple: true },
//                 orderBy: { createdAt: 'desc' }
//             })
//         ]);

//         const pendingApprovalsList = [
//             ...pTemples.map(t => {
//                 const lt = localize(t, lang);
//                 return {
//                     id: t.id,
//                     name: lt.name,
//                     location: lt.location,
//                     type: 'Temple',
//                     date: t.createdAt
//                 };
//             }),
//             ...pProducts.map(p => {
//                 const lp = localize(p, lang);
//                 return {
//                     id: p.id,
//                     name: lp.name,
//                     location: 'Product',
//                     type: 'Product',
//                     date: p.createdAt
//                 };
//             }),
//             ...pWithdrawals.map(w => ({
//                 id: w.id,
//                 name: `₹${w.amount} Withdrawal`,
//                 location: w.temple ? (localize(w.temple, lang).name) : (w.seller?.name || 'Seller'),
//                 type: 'Payout',
//                 date: w.createdAt
//             })),
//             ...pPoojas.map(p => {
//                 const lp = localize(p, lang);
//                 return {
//                     id: p.id,
//                     name: lp.name,
//                     location: p.temple ? (localize(p.temple, lang).name) : 'Temple Pooja',
//                     type: 'Pooja',
//                     date: p.createdAt
//                 };
//             })
//         ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

//         res.json({
//             success: true,
//             data: {
//                 stats: {
//                     totalTemples,
//                     totalUsers,
//                     totalBookings: totalPoojaBookings + totalProductOrders,
//                     totalDonations,
//                     totalRevenue,
//                     revenueBreakdown
//                 },
//                 pending: {
//                     temples: pendingTemples,
//                     products: pendingProducts,
//                     withdrawals: pendingWithdrawals,
//                     poojas: pendingPoojas,
//                     total: pendingTemples + pendingProducts + pendingWithdrawals + pendingPoojas
//                 },
//                 activities,
//                 pendingApprovals: pendingApprovalsList
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching admin dashboard stats:', error);
//         res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };


import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { localize } from '../../utils/localization';

export const getAdminDashboardStats = async (req: Request, res: Response) => {
    try {
        const lang = (req.headers['x-lang'] as string) || (req.query.lang as string) || 'en';

        // Donation commission rate
        const DONATION_COMMISSION_RATE = 0.02; // 2%

        // 1. Core Statistics - WITH COMPLETED FILTER
        const [
            totalTemples,
            totalUsers,
            totalPoojaBookings,
            totalProductOrders,
            totalDonationsCount,
            completedBookingsRevenue,
            completedOrdersRevenue,
        ] = await Promise.all([
            prisma.temple.count(),
            prisma.user.count({ where: { role: 'DEVOTEE' } }),
            prisma.poojaBooking.count({ where: { status: { not: 'PENDING' } } }),
            prisma.order.count(),
            prisma.donation.count({ where: { status: { in: ['COMPLETED', 'SUCCESS'] } } }),
            prisma.poojaBooking.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { packagePrice: true }
            }),
            prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { totalAmount: true }
            })
        ]);

        // ✅ FIX: Donations - Get temple amount and calculate gross with commission
        let templeDonationAmount = 0;
        let donationGrossAmount = 0;
        let donationCommission = 0;
        
        try {
            const donationsResult: any = await prisma.$queryRaw`
                SELECT SUM(CAST(amount AS INTEGER)) as total 
                FROM "Donation" 
                WHERE status IN ('COMPLETED', 'SUCCESS')
            `;
            templeDonationAmount = Number(donationsResult[0]?.total) || 0;
            
            // Calculate gross amount (what devotee paid) including 2% commission
            donationGrossAmount = templeDonationAmount * (1 + DONATION_COMMISSION_RATE);
            donationCommission = templeDonationAmount * DONATION_COMMISSION_RATE;
            
            console.log('Donations - Temple Amount:', templeDonationAmount);
            console.log('Donations - Gross Amount (Devotee Paid):', donationGrossAmount);
            console.log('Donations - Commission:', donationCommission);
        } catch (error) {
            console.error('Donations query error:', error);
        }

        // ✅ TOTAL REVENUE (All 3 sources) - Use GROSS amount (devotee paid)
        const totalRevenue = 
            Number(completedBookingsRevenue._sum.packagePrice || 0) + 
            Number(completedOrdersRevenue._sum.totalAmount || 0) + 
            donationGrossAmount;  // ← Gross amount, not temple amount

        // Revenue Breakdown
        const revenueBreakdown = {
            bookings: Number(completedBookingsRevenue._sum.packagePrice || 0),
            orders: Number(completedOrdersRevenue._sum.totalAmount || 0),
            donations: templeDonationAmount,  // Temple gets this
            donationGross: donationGrossAmount,  // Devotee paid this
            donationCommission: donationCommission  // Platform earns
        };

        console.log('📊 Revenue Debug:', revenueBreakdown, 'Total:', totalRevenue);

        // 2. Pending Approvals
        const [pendingTemples, pendingProducts, pendingWithdrawals, pendingPoojas] = await Promise.all([
            prisma.user.count({
                where: {
                    role: 'INSTITUTION',
                    isVerified: false
                }
            }),
            prisma.product.count({ where: { status: 'pending' } }),
            prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
            prisma.pooja.count({ where: { status: false } })
        ]);

        // 3. Recent Activity (Combined)
        const [recentBookings, recentUsers, recentTemples] = await Promise.all([
            prisma.poojaBooking.findMany({
                where: { status: 'COMPLETED' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { pooja: true, temple: true }
            }),
            prisma.user.findMany({
                take: 5,
                where: { role: 'DEVOTEE' },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.temple.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            })
        ]);

        // Format activities
        const activities: any[] = [
            ...recentBookings.map(b => {
                const lp = localize(b.pooja, lang);
                const lt = b.temple ? localize(b.temple, lang) : null;
                return {
                    id: b.id,
                    type: 'booking',
                    title: `New booking for ${lp.name || 'Pooja'}`,
                    description: `At ${lt?.name || 'Platform'} • ₹${b.packagePrice}`,
                    time: b.createdAt
                };
            }),
            ...recentUsers.map(u => ({
                id: u.id,
                type: 'user',
                title: `New user registration`,
                description: u.name || u.phone || 'Anonymous',
                time: u.createdAt
            })),
            ...recentTemples.map(t => {
                const lt = localize(t, lang);
                return {
                    id: t.id,
                    type: 'temple',
                    title: `New temple registered`,
                    description: lt.name,
                    time: t.createdAt
                };
            })
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

        // 4. Pending Items List for UI - Mixed types
        const [pTemples, pProducts, pWithdrawals, pPoojas] = await Promise.all([
            prisma.temple.findMany({
                where: { user: { role: 'INSTITUTION', isVerified: false } },
                take: 2,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.findMany({
                where: { status: 'pending' },
                take: 2,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.withdrawalRequest.findMany({
                where: { status: 'PENDING' },
                take: 2,
                include: { temple: true, seller: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.pooja.findMany({
                where: { status: false },
                take: 2,
                include: { temple: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const pendingApprovalsList = [
            ...pTemples.map(t => {
                const lt = localize(t, lang);
                return {
                    id: t.id,
                    name: lt.name,
                    location: lt.location,
                    type: 'Temple',
                    date: t.createdAt
                };
            }),
            ...pProducts.map(p => {
                const lp = localize(p, lang);
                return {
                    id: p.id,
                    name: lp.name,
                    location: 'Product',
                    type: 'Product',
                    date: p.createdAt
                };
            }),
            ...pWithdrawals.map(w => ({
                id: w.id,
                name: `₹${w.amount} Withdrawal`,
                location: w.temple ? (localize(w.temple, lang).name) : (w.seller?.name || 'Seller'),
                type: 'Payout',
                date: w.createdAt
            })),
            ...pPoojas.map(p => {
                const lp = localize(p, lang);
                return {
                    id: p.id,
                    name: lp.name,
                    location: p.temple ? (localize(p.temple, lang).name) : 'Temple Pooja',
                    type: 'Pooja',
                    date: p.createdAt
                };
            })
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        res.json({
            success: true,
            data: {
                stats: {
                    totalTemples,
                    totalUsers,
                    totalBookings: totalPoojaBookings + totalProductOrders,
                    totalDonations: templeDonationAmount,  // Temple gets
                    totalRevenue,  // Gross revenue (devotee paid)
                    revenueBreakdown
                },
                pending: {
                    temples: pendingTemples,
                    products: pendingProducts,
                    withdrawals: pendingWithdrawals,
                    poojas: pendingPoojas,
                    total: pendingTemples + pendingProducts + pendingWithdrawals + pendingPoojas
                },
                activities,
                pendingApprovals: pendingApprovalsList
            }
        });

    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};