import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import { prisma } from '../models/prismaClient.js';

/**
 * Get all categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { menus: true },
        },
      },
    });

    return successResponse(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get categories'));
  }
};

/**
 * Get menus by category
 */
export const getMenusByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const menus = await prisma.menu.findMany({
      where: {
        categoryId: parseInt(categoryId),
        isAvailable: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, menus, 'Menus retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get menus'));
  }
};

/**
 * Get all menus
 */
export const getAllMenus = async (req, res, next) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { isAvailable: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { category: { order: 'asc' } },
        { name: 'asc' },
      ],
    });

    return successResponse(res, menus, 'All menus retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get menus'));
  }
};

/**
 * Get menu by ID
 */
export const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!menu) {
      return next(new ApiError(404, 'Menu not found'));
    }

    return successResponse(res, menu, 'Menu retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get menu'));
  }
};

/**
 * Search menus
 */
export const searchMenus = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return next(new ApiError(400, 'Search query is required'));
    }

    const menus = await prisma.menu.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, menus, `Found ${menus.length} menus`);
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to search menus'));
  }
};
