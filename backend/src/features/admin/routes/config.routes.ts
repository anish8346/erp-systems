import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';

export const configRouter = Router();

configRouter.get('/audit-logs', AdminController.getAuditLogs);
configRouter.post('/work-centers', AdminController.createWorkCenter);
configRouter.get('/work-centers', AdminController.getWorkCenters);
configRouter.get('/users', AdminController.getUsers);
