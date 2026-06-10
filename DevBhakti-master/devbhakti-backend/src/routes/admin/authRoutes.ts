// import { Router } from 'express';
// import { adminLogin, staffForgotPasswordRequest, sendAdminPasswordChangeOTP, changeAdminPassword } from '../../controllers/admin/authController';
// import { authenticate } from '../../middleware/authMiddleware';

// const router = Router();

// router.post('/login', adminLogin);
// router.post('/staff-forgot-password', staffForgotPasswordRequest);
// router.post('/send-change-password-otp', authenticate, sendAdminPasswordChangeOTP);
// router.post('/change-password', authenticate, changeAdminPassword);
// router.post('/admin/verify-otp', verifyAdminOTP);  // NEW ROUTE

// export default router;



import { Router } from 'express';
import { 
  adminLogin, 
  staffForgotPasswordRequest, 
  sendAdminPasswordChangeOTP, 
  changeAdminPassword,
  verifyAdminOTP  // ✅ Add this import
} from '../../controllers/admin/authController';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.post('/login', adminLogin);
router.post('/staff-forgot-password', staffForgotPasswordRequest);
router.post('/send-change-password-otp', authenticate, sendAdminPasswordChangeOTP);
router.post('/change-password', authenticate, changeAdminPassword);
router.post('/verify-otp', authenticate, verifyAdminOTP);  

export default router;
