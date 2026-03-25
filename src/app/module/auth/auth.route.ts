import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post('/register-player', AuthController.registerPlayer);
router.post('/create-turf-owner', AuthController.createTurfOwner);

router.post('/login', AuthController.login);

export const AuthRoutes = router;
