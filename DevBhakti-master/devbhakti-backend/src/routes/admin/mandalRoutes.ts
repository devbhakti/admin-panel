import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllMandals,
    getMandalById,
    createMandal,
    updateMandal,
    deleteMandal,
    toggleMandalStatus,
} from '../../controllers/admin/mandalController';
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

// ─── Multer Config ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../../uploads/mandals');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

const mandalUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'bannerImages', maxCount: 10 },
    { name: 'documentUrl', maxCount: 1 },
]);

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.use(authenticate);

// ─── Routes ──────────────────────────────────────────────────────────────────
router.get('/', getAllMandals);
router.get('/:id', getMandalById);
router.post('/', mandalUpload, createMandal);
router.put('/:id', mandalUpload, updateMandal);
router.patch('/:id/status', toggleMandalStatus);
router.delete('/:id', deleteMandal);

export default router;
