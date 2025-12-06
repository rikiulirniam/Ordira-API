import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../services/userService.js';

/**
 * Get all users
 */
export const listUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to get users'));
  }
};

/**
 * Get user by ID
 */
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(parseInt(id));
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    if (error.message === 'User not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to get user'));
  }
};

/**
 * Create new user
 */
export const createNewUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return next(new ApiError(400, 'Username, password, and role are required'));
    }

    const validRoles = ['ADMIN', 'KASIR'];
    if (!validRoles.includes(role)) {
      return next(new ApiError(400, `Role must be one of: ${validRoles.join(', ')}`));
    }

    const user = await createUser({ username, password, role });
    return successResponse(res, user, 'User created successfully', 201);
  } catch (error) {
    if (error.message === 'Username already exists') {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to create user'));
  }
};

/**
 * Update user
 */
export const updateUserData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (role) {
      const validRoles = ['ADMIN', 'KASIR'];
      if (!validRoles.includes(role)) {
        return next(new ApiError(400, `Role must be one of: ${validRoles.join(', ')}`));
      }
    }

    const user = await updateUser(parseInt(id), { username, password, role });
    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    if (error.message === 'User not found') {
      return next(new ApiError(404, error.message));
    }
    if (error.message === 'Username already exists') {
      return next(new ApiError(400, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to update user'));
  }
};

/**
 * Delete user
 */
export const removeUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(parseInt(id));
    return successResponse(res, result, 'User deleted successfully');
  } catch (error) {
    if (error.message === 'User not found') {
      return next(new ApiError(404, error.message));
    }
    return next(new ApiError(500, error.message || 'Failed to delete user'));
  }
};
