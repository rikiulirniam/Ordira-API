import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../services/menuService.js';
import { deleteImageFile } from '../middlewares/upload.js';

/**
 * Get all menus (Admin view - includes unavailable)
 */
export const listAllMenus = async (req, res, next) => {
  try {
    const { includeUnavailable, categoryId } = req.query;
    const menus = await getAllMenus({ 
      includeUnavailable: includeUnavailable === 'true',
      categoryId: categoryId ? parseInt(categoryId) : undefined,
    });
    return successResponse(res, menus, 'Menus retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get menus'));
  }
};

/**
 * Get menu by ID
 */
export const getMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menu = await getMenuById(parseInt(id));
    return successResponse(res, menu, 'Menu retrieved successfully');
  } catch (error) {
    if (error.message === 'Menu not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to get menu'));
  }
};

/**
 * Create new menu
 */
export const createNewMenu = async (req, res, next) => {
  try {
    const { name, price, description, categoryId, isAvailable } = req.body;

    if (!name || !price || !categoryId) {
      return next(new ApiError(400, 'Name, price, and categoryId are required'));
    }

    if (price < 0) {
      return next(new ApiError(400, 'Price must be a positive number'));
    }

    // Get image path from uploaded file
    const image = req.file ? `/uploads/menus/${req.file.filename}` : null;

    const menu = await createMenu({ name, price: parseFloat(price), description, image, categoryId: parseInt(categoryId), isAvailable: Boolean(isAvailable) });
    return successResponse(res, menu, 'Menu created successfully', 201);
  } catch (error) {
    // Delete uploaded file if menu creation fails
    if (req.file) {
      deleteImageFile(req.file.filename);
    }
    
    if (error.message === 'Category not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to create menu'));
  }
};

/**
 * Update menu
 */
export const updateMenuData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId, isAvailable } = req.body;

    if (price !== undefined && price < 0) {
      return next(new ApiError(400, 'Price must be a positive number'));
    }

    // Get old menu data to delete old image if new one is uploaded
    const oldMenu = await getMenuById(parseInt(id));
    
    // Get new image path from uploaded file
    const image = req.file ? `/uploads/menus/${req.file.filename}` : undefined;

    const menu = await updateMenu(parseInt(id), { name, price: price !== undefined ? parseFloat(price) : undefined, description, image, categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined, isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined });
    
    // Delete old image if new one was uploaded
    if (req.file && oldMenu.image) {
      deleteImageFile(oldMenu.image);
    }
    
    return successResponse(res, menu, 'Menu updated successfully');
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      deleteImageFile(req.file.filename);
    }
    
    if (error.message === 'Menu not found') {
      return next(new ApiError(404, error.message));
    }
    if (error.message === 'Category not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to update menu'));
  }
};

/**
 * Delete menu
 */
export const removeMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get menu data to delete associated image
    const menu = await getMenuById(parseInt(id));
    
    const result = await deleteMenu(parseInt(id));
    
    // Delete image file if exists
    if (menu.image) {
      deleteImageFile(menu.image);
    }
    
    return successResponse(res, result, 'Menu deleted successfully');
  } catch (error) {
    if (error.message === 'Menu not found') {
      return next(new ApiError(404, error.message));
    }
    if (error.message.includes('Cannot delete menu')) {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to delete menu'));
  }
};
