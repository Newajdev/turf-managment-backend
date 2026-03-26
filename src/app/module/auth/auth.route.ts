import express from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { AuthValidations } from './auth.validation';

const router = express.Router();

router.post('/register-player', validateRequest(AuthValidations.registerPlayerSchema), AuthController.registerPlayer);
router.post('/create-turf-owner', validateRequest(AuthValidations.createTurfOwnerSchema), AuthController.createTurfOwner);

router.post('/login', validateRequest(AuthValidations.loginSchema), AuthController.login);

export const AuthRoutes = router;
