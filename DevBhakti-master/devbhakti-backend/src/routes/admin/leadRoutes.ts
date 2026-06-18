import { Router } from 'express';
import { getAllLeads, updateLeadStatus, deleteLead, exportLeads } from '../../controllers/admin/leadManagementController';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = Router();

// Assuming authenticate and authorize('ADMIN') are standard for admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllLeads);
router.patch('/:id/status', authenticate, authorize('ADMIN'), updateLeadStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteLead);
router.get('/export', authenticate, authorize('ADMIN'), exportLeads); 

export default router;
