import { Router } from 'express';
import {
  listAllMenus,
  getMenu,
  createNewMenu,
  updateMenuData,
  removeMenu,
} from '../controllers/menuManagementController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadMenuImage } from '../middlewares/upload.js';

const router = Router();

// Admin-only routes for menu management
router.get('/admin/menus', authenticate, authorize(['ADMIN']), listAllMenus);
router.get('/admin/menus/:id', authenticate, authorize(['ADMIN']), getMenu);
router.post('/admin/menus', authenticate, authorize(['ADMIN']), uploadMenuImage.single('image'), createNewMenu);
router.put('/admin/menus/:id', authenticate, authorize(['ADMIN']), uploadMenuImage.single('image'), updateMenuData);
router.delete('/admin/menus/:id', authenticate, authorize(['ADMIN']), removeMenu);

export default router;
