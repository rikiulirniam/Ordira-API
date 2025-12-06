import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import { updateMenu } from '../services/menuService.js';

/**
 * Toggle menu availability (Kasir only)
 */
export const toggleMenuAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return next(new ApiError(400, 'isAvailable field is required'));
    }

    const menu = await updateMenu(parseInt(id), { isAvailable });
    
    const message = isAvailable ? 'Menu is now available' : 'Menu is now unavailable';
    return successResponse(res, menu, message);
  } catch (error) {
    if (error.message === 'Menu not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to update menu availability'));
  }
};
