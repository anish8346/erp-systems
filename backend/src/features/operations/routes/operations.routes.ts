import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller.js';
import { authenticate, authorize } from '../../../core/middlewares/authMiddleware.js';

export const manufacturingRouter = Router();
export const bomRouter = Router();

// Manufacturing Routes
manufacturingRouter.get('/', authenticate, authorize(['MFG', 'INVENTORY', 'SALES', 'PURCHASE']), OperationsController.getMOs);
manufacturingRouter.post('/', authenticate, authorize(['MFG']), OperationsController.createMO);
manufacturingRouter.post('/:id/confirm', authenticate, authorize(['MFG']), OperationsController.confirmMO);
manufacturingRouter.post('/:id/produce', authenticate, authorize(['MFG']), OperationsController.produceMO);
manufacturingRouter.post('/:id/cancel', authenticate, authorize(['MFG']), OperationsController.cancelMO);

// Nested Updates
manufacturingRouter.patch('/work-order/:id/status', authenticate, authorize(['MFG']), OperationsController.updateWorkOrderStatus);
manufacturingRouter.patch('/work-order/:id/duration', authenticate, authorize(['MFG']), OperationsController.updateWorkOrderDuration);
manufacturingRouter.patch('/component/:id/consumed', authenticate, authorize(['MFG']), OperationsController.updateComponentConsumed);

// BoM Routes
bomRouter.get('/', authenticate, authorize(['MFG', 'INVENTORY', 'SALES', 'PURCHASE']), async (req, res) => {
    try {
        const { OperationsRepository } = await import('../repositories/operations.repository.js');
        const boms = await OperationsRepository.findAllBoMs();
        res.json(boms);
    } catch (error: unknown) {
        console.error('[FetchBoMs Error]:', error);
        res.status(500).json({ error: 'Failed to fetch Bill of Materials.' });
    }
});
