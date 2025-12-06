import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createNewCategory,
  updateCategoryData,
  removeCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Admin-only routes for category management
router.post('/admin/categories', authenticate, authorize(['ADMIN']), createNewCategory);
router.put('/admin/categories/:id', authenticate, authorize(['ADMIN']), updateCategoryData);
router.delete('/admin/categories/:id', authenticate, authorize(['ADMIN']), removeCategory);
router.get('/admin/categories', authenticate, authorize(['ADMIN']), listCategories);
router.get('/admin/categories/:id', authenticate, authorize(['ADMIN']), getCategory);

export default router;
