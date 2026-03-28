import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.PLAYER,
      },
      userStatus: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  emailVerification:{
    sendOnSignIn:true,
    sendOnSignUp:true,
    autoSignInAfterVerification:true,
    
  },

  session: {
    expiresIn: 60 * 60 * 60 * 24,
    updateAge: 60 * 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24,
    },
  },


  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification:true,
      async sendVerificationOTP({email, otp, type}){

        if(type === "email-verification"){
          const user = await prisma.user.findUnique({
            where:{
              email:email
            }
          })

          if(!user){
            throw new Error("User not found");
          }

          if(user && !user.emailVerified){
            sendEmail({
              to:email,
              subject:"Email Verification",
              templateName:"email-verification",
              templateData:{
                name:user.name,
                otp:otp,
                expiresIn: 2
              }
            })
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (user) {
            sendEmail({
              to: email,
              subject: "Passowrd Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp: otp,
                expiresIn: 2
              },
            });
          }
        }
        
      },
      
      expiresIn: 2 * 60,
      otpLength:6

      })
  ],

});
