import { successResponse } from '../core/response.js';
import { ApiError } from '../core/apiError.js';
import { handleCustomerChat } from '../ai/aiService.js';

/**
 * Customer chat endpoint - Public
 * Handles menu recommendations and general inquiries
 */
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return next(new ApiError(400, 'Message is required'));
    }

    const response = await handleCustomerChat(message);
    return successResponse(res, response, 'Menu recommendations generated');
  } catch (error) {
    return next(new ApiError(500, error.message || 'Failed to process chat'));
  }
};
