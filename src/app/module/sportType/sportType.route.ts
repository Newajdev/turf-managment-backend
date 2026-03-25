import express from 'express';
import { SportTypeController } from './sportType.controller';

const router = express.Router();


router.post('/', SportTypeController.createSportType);
router.get('/', SportTypeController.getAllSportTypes);
router.get('/:id', SportTypeController.getSingleSportType);
router.patch('/:id', SportTypeController.updateSportType);
router.delete('/:id', SportTypeController.deleteSportType);

export const SportTypeRoutes = router;
