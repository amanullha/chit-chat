import { IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';

export enum LoginRequestType {
  Email = 'email',
  Refresh = 'refresh',
}

export class UserLoginDto {
  @IsNotEmpty({ message: 'Type_empty' })
  @IsEnum(LoginRequestType)
  type: LoginRequestType;

  @ValidateIf((o) => o.type === LoginRequestType.Email)
  @IsNotEmpty({ message: 'Email_empty' })
  email: string;

  @ValidateIf((o) => o.type === LoginRequestType.Email)
  @IsNotEmpty({ message: 'Password_empty' })
  password: string;

  @ValidateIf((o) => o.type === LoginRequestType.Refresh)
  @IsNotEmpty({ message: 'RefreshToken_empty' })
  refreshToken: string;
}
