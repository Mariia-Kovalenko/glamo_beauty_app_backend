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
import { diskStorage } from 'multer';
import path = require('path');
import { v4 as uuid } from 'uuid';
import { Param, Res } from '@nestjs/common/decorators';
import { join } from 'path';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuid();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

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

  @Get('masters/near')
  async getMastersNearMe(@Request() req) {
    const { lat, lng, radius } = req.body;
    return await this.userService.fetchMastersByLocation();
  }

  @Patch('address')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({
    description: 'Address successfully updated',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async setAddress(@Body() userAddress: AddressDto, @Request() req) {
    const res = await this.userService.setUserAddress(
      req.user.userId,
      userAddress.address,
      userAddress.location,
    );
    return res;
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return await this.userService.setUserProfileImage(
      req.user.userId,
      file.filename,
    );
  }

  @Get('profile-image/:imageName')
  async getProfileImage(@Param('imageName') imageName: string, @Res() res) {
    return res.sendFile(
      join(process.cwd(), 'uploads/profileImages/' + imageName),
    );
  }
}
