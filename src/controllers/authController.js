import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import { register, login } from '../services/authService.js';

export const registerUser = async (req, res, next) => {
	try {
		const data = await register(req.body);
		return successResponse(res, data, 'Registered', 201);
	} catch (e) {
		if (e?.code === 'P2002') return next(new ApiError(409, 'Username already exists'));
		return next(new ApiError(400, e.message || 'Bad Request'));
	}
};

export const loginUser = async (req, res, next) => {
	try {
		const data = await login(req.body);
		return successResponse(res, data, 'Logged in');
	} catch (e) {
		return next(new ApiError(401, e.message || 'Unauthorized'));
	}
};

