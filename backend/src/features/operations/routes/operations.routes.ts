import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const manufacturingRouter = Router();
export const bomRouter = Router();

// Manufacturing Routes
manufacturingRouter.get('/', authenticate, OperationsController.getMOs);
manufacturingRouter.post('/', authenticate, OperationsController.createMO);
manufacturingRouter.post('/:id/confirm', authenticate, OperationsController.confirmMO);
manufacturingRouter.post('/:id/produce', authenticate, OperationsController.produceMO);
manufacturingRouter.post('/:id/cancel', authenticate, OperationsController.cancelMO);

// Nested Updates
manufacturingRouter.patch('/work-order/:id/status', authenticate, OperationsController.updateWorkOrderStatus);
manufacturingRouter.patch('/work-order/:id/duration', authenticate, OperationsController.updateWorkOrderDuration);
manufacturingRouter.patch('/component/:id/consumed', authenticate, OperationsController.updateComponentConsumed);

// BoM Routes
bomRouter.get('/', authenticate, async (req, res) => {
    try {
        const { OperationsRepository } = await import('../repositories/operations.repository.js');
        const boms = await OperationsRepository.findAllBoMs();
        res.json(boms);
    } catch (error: unknown) {
        console.error('[FetchBoMs Error]:', error);
        res.status(500).json({ error: 'Failed to fetch Bill of Materials.' });
    }
});
