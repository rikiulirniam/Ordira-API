import { Router } from 'express';
import {
  listUsers,
  getUser,
  createNewUser,
  updateUserData,
  removeUser,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require Admin authentication
router.use(authenticate, authorize(['ADMIN']));

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/users', createNewUser);
router.put('/users/:id', updateUserData);
router.delete('/users/:id', removeUser);

export default router;
