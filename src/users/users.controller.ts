import {
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from './user.model';
import { Roles } from 'src/decorators/roles.decorator';
import { AddressDto } from './dtos/Address.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { METADATA_AUTHORIZED_KEY } from 'src/config';
import { Param, Res } from '@nestjs/common/decorators';
import { join } from 'path';
import { storage } from './helpers/uploads-storage';
import { UpdateUserDto } from './dtos/UpdateUserDto.dto';
import * as fs from 'fs';

@ApiTags('users')
@ApiBearerAuth(METADATA_AUTHORIZED_KEY)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.userService.fetchUsers();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'User found',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async getUserInfo(@Request() req) {
    const userId = req.user.userId;
    const userFound = await this.userService.getUserById(userId);
    if (!userFound) {
      throw new HttpException(
        'User not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return userFound;
  }

  @Get('masters')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    description: 'Users found',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async getMasters() {
    return await this.userService.fetchMasters();
  }

  @Get('masters/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'User found',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getMasterById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Post('masters/near')
  @ApiOkResponse({
    description: 'Users found',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  async getMastersNearMe(@Request() req) {
    const { lat, lng, radius, serviceTypes } = req.body;
    return await this.userService.fetchMastersByLocation(
      Number(lat),
      Number(lng),
      Number(radius),
      serviceTypes,
    );
  }

  @Patch('update')
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateMaster(@Request() req, @Body() userData: UpdateUserDto) {
    return await this.userService.updateUser(
      req.user.userId,
      userData
    )
  }


  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file?.filename) {
      throw new HttpException(
        'File must be a png, jpg/jpeg',
        HttpStatus.BAD_REQUEST,
      );
    }

    // delete previous photo from storage
    const user = await this.userService.getUserById(req.user.userId);
    if (user.profileImage) {
      fs.unlinkSync(`./uploads/profileImages/${user.profileImage}`);
    }
    
    return await this.userService.setUserProfileImage(
      req.user.userId,
      file.filename,
    );
  }

  @Get('profile-image/:imageName')
  @ApiOkResponse({
    description: 'Image found',
  })
  async getProfileImage(@Param('imageName') imageName: string, @Res() res) {
    return res.sendFile(
      join(process.cwd(), 'uploads/profileImages/' + imageName),
    );
  }
}
