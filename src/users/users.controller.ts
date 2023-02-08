import {
  Controller,
  Get,
  Patch,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from './user.model';
import { Roles } from 'src/decorators/roles.decorator';
import { AddressDto } from './dtos/Address.dto';
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
}
