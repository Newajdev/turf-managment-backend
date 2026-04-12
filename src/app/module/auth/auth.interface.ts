export interface IRegisterPlayer {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  profilePhoto?: string;
}

export interface ICreateTurfOwner {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  profilePhoto?: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}

export interface IResetPassword {
  email: string;
  otp: string;
  Password: string;
}

