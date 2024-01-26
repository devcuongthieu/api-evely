import { $Enums } from '@prisma/client';

export class UserDto {
  id: number;
  email: string;
  email_verified?: Date;
  first_name: string;
  last_name: string;
  role: $Enums.Role;
  created_at: Date;
  updated_at: Date;
}
