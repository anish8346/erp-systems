import { Router } from 'express';
import { getAuditLogs, createWorkCenter, getWorkCenters, getUsers } from '../controllers/configController';

const router = Router();

router.get('/audit-logs', getAuditLogs);
router.get('/work-centers', getWorkCenters);
router.post('/work-centers', createWorkCenter);
router.get('/users', getUsers);

export default router;
