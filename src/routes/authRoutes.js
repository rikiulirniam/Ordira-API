import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/auth/register', authenticate, authorize(['ADMIN']), registerUser);
router.post('/auth/login', loginUser);

export default router;
