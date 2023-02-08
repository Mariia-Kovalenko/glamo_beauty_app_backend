import { Controller, Post, UseGuards, Request, Put } from '@nestjs/common';
import { Role } from 'src/users/user.model';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { Body, Get, Param } from '@nestjs/common/decorators';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from './dtos/CreateAppointment.dto';
import { DateRangeDto } from './dtos/DateRangeDto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentService: AppointmentsService) {}

  @Get(':id')
  @Roles(Role.MASTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', required: true, description: 'Master id' })
  async getAppointmentsBetweenDates(
    @Param('id') id: string,
    @Body() datesRange: DateRangeDto,
  ) {
    const { start, end } = datesRange;
    return this.appointmentService.getAppointmentsBetweenDates(id, start, end);
  }

  @Post('create')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createAppointment(
    @Body() appointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    const customer = req.user.userId;
    const { masterId, date, day, start, end } = appointmentDto;
    const res = await this.appointmentService.createAppointment(
      customer,
      masterId,
      date,
      day,
      start,
      end,
    );
    return res;
  }

  @Put('cancel/:id')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiParam({ name: 'id', required: true, description: 'Appointment id' })
  async cancelAppointment(@Param('id') id: string) {
    return await this.appointmentService.cancelAppointment(id);
  }
}
