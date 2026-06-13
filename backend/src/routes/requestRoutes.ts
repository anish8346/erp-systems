import { Router } from 'express';
import { submitRequest, getRequests, updateRequestStatus } from '../controllers/requestController';

const router = Router();

// Public route
router.post('/submit', submitRequest);

// Admin routes (should ideally have auth middleware)
router.get('/', getRequests);
router.patch('/:id', updateRequestStatus);

export default router;
