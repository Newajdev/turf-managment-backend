import express from 'express';
import { SportTypeController } from './sportType.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { SportTypeValidations } from './sportType.validation';
import { checkAuth } from '../../middleware/AuthUser';
import { Role } from '../../../generated/prisma/enums';

const router = express.Router();


router.post('/', checkAuth(Role.SYSTEM_ADMIN), validateRequest(SportTypeValidations.sportTypeValidationSchema), SportTypeController.createSportType);
router.get('/', SportTypeController.getAllSportTypes);
router.get('/:id', SportTypeController.getSingleSportType);
router.patch('/:id', checkAuth(Role.SYSTEM_ADMIN), validateRequest(SportTypeValidations.updateSportTypeValidationSchema), SportTypeController.updateSportType);
router.delete('/:id', checkAuth(Role.SYSTEM_ADMIN), SportTypeController.deleteSportType);

export const SportTypeRoutes = router;
