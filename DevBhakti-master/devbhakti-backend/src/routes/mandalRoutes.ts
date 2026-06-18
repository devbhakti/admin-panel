import { Router } from 'express';
import * as mandalController from '../controllers/mandalController';

const router = Router();

// Public route to submit a new Mandal Registration
router.post('/register', mandalController.registerMandal);

export default router;
