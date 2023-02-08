import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { Role } from '../user.model';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'John',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email',
    example: 'john@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: '12345',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ name: 'role', enum: Role })
  role: Role;
}
