import { Router } from 'express';
import {
  getCategories,
  getMenusByCategory,
  getAllMenus,
  getMenuById,
  searchMenus,
} from '../controllers/menuController.js';

const router = Router();

// Public endpoints - no authentication required
router.get('/categories', getCategories);
router.get('/categories/:categoryId/menus', getMenusByCategory);

router.get('/menus', getAllMenus);
router.get('/menus/search', searchMenus);
router.get('/menus/:id', getMenuById);

export default router;
