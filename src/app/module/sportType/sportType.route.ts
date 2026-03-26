import express from 'express';
import { SportTypeController } from './sportType.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { SportTypeValidations } from './sportType.validation';

const router = express.Router();


router.post('/', validateRequest(SportTypeValidations.sportTypeValidationSchema), SportTypeController.createSportType);
router.get('/', SportTypeController.getAllSportTypes);
router.get('/:id', SportTypeController.getSingleSportType);
router.patch('/:id', validateRequest(SportTypeValidations.updateSportTypeValidationSchema), SportTypeController.updateSportType);
router.delete('/:id', SportTypeController.deleteSportType);

export const SportTypeRoutes = router;
