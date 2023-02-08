import { Body, Controller, Get, Param } from '@nestjs/common';
import { Patch, UseGuards, Request } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/users/user.model';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SchedulesService } from './schedules.service';
import { RolesGuard } from 'src/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { METADATA_AUTHORIZED_KEY } from 'src/config';
import { ScheduleDto } from './dtos/ScheduleDto';

@ApiTags('schedules')
@ApiBearerAuth(METADATA_AUTHORIZED_KEY)
@Controller('schedules')
export class SchedulesController {
  constructor(private scheduleService: SchedulesService) {}

  @Patch('hours')
  @Roles(Role.MASTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    description: 'Schedule set successfully',
  })
  @ApiConflictResponse({
    description: 'Time already exists on schedule',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async setOpeningHours(@Body() scheduleData: ScheduleDto, @Request() req) {
    const { day, start, end } = scheduleData;
    return await this.scheduleService.setOpeningHours(
      req.user.userId,
      day,
      start,
      end,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', required: true, description: 'Master id' })
  @ApiOkResponse({
    description: 'Schedule found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({ description: 'Schedule for user not found' })
  @ApiInternalServerErrorResponse({
    description: 'Server Error',
  })
  async getUserSchedule(@Param('id') id: string) {
    return await this.scheduleService.getUserSchedule(id);
  }
}
