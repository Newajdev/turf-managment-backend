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