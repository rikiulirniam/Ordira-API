import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js';

/**
 * Get all categories
 */
export const listCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const categories = await getAllCategories({ 
      includeInactive: includeInactive === 'true' 
    });
    return successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get categories'));
  }
};

/**
 * Get category by ID
 */
export const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(parseInt(id));
    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    if (error.message === 'Category not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to get category'));
  }
};

/**
 * Create new category
 */
export const createNewCategory = async (req, res, next) => {
  try {
    const { name, description, icon, order, isActive } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Category name is required'));
    }

    const category = await createCategory({ name, description, icon, order, isActive });
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    if (error.message === 'Category name already exists') {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to create category'));
  }
};

/**
 * Update category
 */
export const updateCategoryData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order, isActive } = req.body;

    const category = await updateCategory(parseInt(id), { name, description, icon, order, isActive });
    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    if (error.message === 'Category not found') {
      return next(new ApiError(404, error.message));
    }
    if (error.message === 'Category name already exists') {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to update category'));
  }
};

/**
 * Delete category
 */
export const removeCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteCategory(parseInt(id));
    return successResponse(res, result, 'Category deleted successfully');
  } catch (error) {
    if (error.message === 'Category not found') {
      return next(new ApiError(404, error.message));
    }
    if (error.message.includes('Cannot delete category')) {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to delete category'));
  }
};
