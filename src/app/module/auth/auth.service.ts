import { Role } from '../../../generated/prisma/enums';
import { auth } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { IRegisterPlayer, ICreateTurfOwner, ILogin } from './auth.interface';

const registerPlayer = async (payload: IRegisterPlayer) => {
    const { name, email, password} = payload;

    const authResponse = await auth.api.signUpEmail({
        body: {
            email,
            password: password as string,
            name
        },
    });

    const player = await prisma.$transaction(async (tx) => {
        return await tx.player.create({
            data: {
                userId: authResponse.user.id,
                name,
                email,
            },
        });
    });

    return {
        user: authResponse.user,
        token: authResponse.token,
        player,
    };
};

const createTurfOwner = async (payload: ICreateTurfOwner) => {
    const { name, email, password} = payload;

    const authResponse = await auth.api.signUpEmail({
        body: {
            email,
            password: password as string,
            name,
            role: Role.TURF_OWNER,
            needPasswordChange: true,
        },
    });

    const turfOwner = await prisma.$transaction(async (tx) => {
        return await tx.turfOwner.create({
            data: {
                userId: authResponse.user.id,
                name,
                email,
            },
        });
    });

    return {
        user: authResponse.user,
        turfOwner,
    };
};

const login = async (payload: ILogin) => {
    const { email, password } = payload;

    const authResponse = await auth.api.signInEmail({
        body: {
            email,
            password: password as string,
        },
    });

    return authResponse;
};

export const AuthService = {
    registerPlayer,
    createTurfOwner,
    login,
};
