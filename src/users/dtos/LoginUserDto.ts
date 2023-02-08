import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email',
    example: 'alice@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '12345',
  })
  @IsNotEmpty()
  password: string;
}
