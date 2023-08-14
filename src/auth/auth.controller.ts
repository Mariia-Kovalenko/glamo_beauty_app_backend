import { Controller, Get, HttpException, Param, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
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
import { RestorePasswordDto } from './dtos/RestorePasswordDto';
import { Response } from 'express';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto } from './dtos/ForgotPasswordDto';

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

  @Post('forgot_password')
  async forgotPassword(
    @Body() forgotPasswordData: ForgotPasswordDto,
    @Res() res,
  ) {
    const { email } = forgotPasswordData;
    try {
      const link = await this.authService.resetPassword(email);

      // send link to mail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'dummyjohn156@gmail.com',
          pass: 'ekavuvskqfilhsrz',
        },
      });

      const mailOptions = {
        from: 'Node JS App',
        to: email,
        subject: 'Password restoration',
        text: `To restore your password go to link: ${link}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: 'Error' });
        } else {
          return res
            .status(200)
            .json({ message: 'New password sent to your email address' });
        }
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('reset_password/:id/:token')
  async resetPass(
    @Param('id') id: string,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const userVerified = await this.authService.verifyUser(id, token);
      return res.render('reset_password', {
        email: userVerified.email,
        id: id,
        token: token,
      });
    } catch (error) {
      // throw new HttpException('Link expired', HttpStatus.GONE);
      // return expired view
      return res.render('link_expired');
    }
  }

  @Post('reset_password/:id/:token')
  async setNewPassword(
    @Param('id') id: string,
    @Param('token') token: string,
    @Body() restorePasswordDto: RestorePasswordDto,
  ) {
    return await this.authService.setNewPassword(
      id,
      restorePasswordDto.password,
      token,
    );
  }
}
