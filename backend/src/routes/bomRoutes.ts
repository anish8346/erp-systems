import { Router } from 'express';
import { createBoM, getBoMs } from '../controllers/bomController';

const router = Router();

router.post('/', createBoM);
router.get('/', getBoMs);

export default router;
