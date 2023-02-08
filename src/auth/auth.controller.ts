import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { Body, ValidationPipe, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserDto } from 'src/users/dtos/LoginUserDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  @ApiBadRequestResponse({
    description: 'Bad request. User with such email already exists',
  })
  @UsePipes(new ValidationPipe())
  async createUser(@Body() userData: CreateUserDto) {
    const response = await this.authService.createUser(
      userData.username,
      userData.email,
      userData.password,
      userData.role,
    );
    return response;
  }

  @Post('login')
  @ApiCreatedResponse({
    description: 'Login successful',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden. Invalid credentials',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async login(@Body() userData: LoginUserDto) {
    return this.authService.login(userData.email, userData.password);
  }
}
