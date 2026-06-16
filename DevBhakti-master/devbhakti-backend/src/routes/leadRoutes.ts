import express from 'express';
import { captureLead } from '../controllers/leadController';

const router = express.Router();

router.post('/capture', captureLead);

export default router;
