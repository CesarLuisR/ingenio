import { Router } from 'express';
// Importación nombrada (Named Import) para coincidir con el controller
import { 
    getIngenioMetrics, 
    getDashboardHistory, 
    getRecentActivity 
} from '../controllers/dashboardCtrl'; 

const router = Router();

// GET /api/dashboard/:ingenioId/metrics
router.get('/:ingenioId/metrics', getIngenioMetrics);

// GET /api/dashboard/:ingenioId/history
router.get('/:ingenioId/history', getDashboardHistory);

// GET /api/dashboard/:ingenioId/activity
router.get('/:ingenioId/activity', getRecentActivity);

export default router;