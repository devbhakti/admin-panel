import { Router } from 'express';
import { getTempleDevotees, getDevoteeDetail, downloadDevoteesExcel } from '../../controllers/temple_admin/templeController';
import { authenticate, authorize, checkPermission, injectTempleContext } from '../../middleware/authMiddleware';

const router = Router();

router.get('/export/excel', authenticate, checkPermission('users.view'), injectTempleContext, downloadDevoteesExcel);
router.get('/', authenticate, checkPermission('users.view'), injectTempleContext, getTempleDevotees);
router.get('/:id', authenticate, checkPermission('users.view'), injectTempleContext, getDevoteeDetail);

export default router;
