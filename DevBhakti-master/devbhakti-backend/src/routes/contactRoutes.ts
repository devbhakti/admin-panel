import { Router } from 'express';
import { submitContact } from '../controllers/contactController';

const router = Router();

// POST /api/contact
router.post('/', submitContact);

export default router;
