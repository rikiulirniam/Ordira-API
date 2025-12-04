import { Router } from 'express';
import { chat } from '../controllers/aiController.js';

const router = Router();

// Customer chat - public endpoint for menu recommendations and inquiries
router.post('/ai/chat', chat);

export default router;
