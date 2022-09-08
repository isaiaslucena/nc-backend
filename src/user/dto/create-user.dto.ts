import { IsString, IsEmail, IsNotEmpty } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  email: number

  @IsString()
  @IsNotEmpty()
  phoneNumber: string
}
