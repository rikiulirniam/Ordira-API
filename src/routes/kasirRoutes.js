import { Router } from 'express';
import { toggleMenuAvailability } from '../controllers/kasirController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Kasir can update menu availability
router.patch('/kasir/menus/:id/availability', authenticate, authorize(['KASIR', 'ADMIN']), toggleMenuAvailability);

export default router;
