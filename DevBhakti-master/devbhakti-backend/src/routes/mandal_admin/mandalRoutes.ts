import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getMyMandalProfile, updateMyMandalProfile } from '../../controllers/mandal_admin/mandalController';
import { authenticate, injectMandalContext } from '../../middleware/authMiddleware';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/mandals');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/mandals/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.get('/', authenticate, injectMandalContext, getMyMandalProfile);
router.put('/', authenticate, injectMandalContext, (upload as any).fields([
    { name: 'image', maxCount: 1 },
    { name: 'heroImages', maxCount: 10 }
]), updateMyMandalProfile);

export default router;
