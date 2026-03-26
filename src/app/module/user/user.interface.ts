import { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUserUpdate {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  userStatus: UserStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: string;
}
