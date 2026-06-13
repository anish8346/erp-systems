import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';

export const requestRouter = Router();

requestRouter.post('/', AdminController.submitRequest);
requestRouter.get('/', AdminController.getRequests);
requestRouter.patch('/:id', AdminController.updateRequestStatus);
