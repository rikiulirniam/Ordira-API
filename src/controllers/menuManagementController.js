import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../services/menuService.js';

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
    const { name, price, description, image, categoryId, isAvailable } = req.body;

    if (!name || !price || !categoryId) {
      return next(new ApiError(400, 'Name, price, and categoryId are required'));
    }

    if (price < 0) {
      return next(new ApiError(400, 'Price must be a positive number'));
    }

    const menu = await createMenu({ name, price, description, image, categoryId, isAvailable });
    return successResponse(res, menu, 'Menu created successfully', 201);
  } catch (error) {
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
    const { name, price, description, image, categoryId, isAvailable } = req.body;

    if (price !== undefined && price < 0) {
      return next(new ApiError(400, 'Price must be a positive number'));
    }

    const menu = await updateMenu(parseInt(id), { name, price, description, image, categoryId, isAvailable });
    return successResponse(res, menu, 'Menu updated successfully');
  } catch (error) {
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
    const result = await deleteMenu(parseInt(id));
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
