import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'name_empty' })
  name: string;
  @IsNotEmpty({ message: 'email_empty' })
  email: string;
  @IsNotEmpty({ message: 'password_empty' })
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]+$/,
    {
      message:
        'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one special character, and one number',
    },
  )
  password: string;
  @IsOptional()
  phone: string;
}
