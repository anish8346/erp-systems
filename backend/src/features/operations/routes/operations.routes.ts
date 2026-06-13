import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const manufacturingRouter = Router();
manufacturingRouter.post('/', authenticate, OperationsController.createMO);
manufacturingRouter.get('/', OperationsController.getMOs);
manufacturingRouter.post('/:id/produce', authenticate, OperationsController.produceMO);
manufacturingRouter.patch('/work-order/:id/status', authenticate, OperationsController.updateWorkOrderStatus);

export const bomRouter = Router();
bomRouter.post('/', OperationsController.createBoM);
bomRouter.get('/', OperationsController.getBoMs);
