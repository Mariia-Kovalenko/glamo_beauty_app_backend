import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Days } from 'src/schedules/schedule.model';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Customer id',
    example: '63cda09e5b0f6990327aad79',
  })
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Master id',
    example: '63cd9627551ca5cbfb76df83',
  })
  @IsNotEmpty()
  masterId: string;

  @ApiProperty({
    description: 'Appointment date in format mm/dd/yyy',
    example: '02/03/2023',
  })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Day of the week',
    enum: Days,
    example: Days.SUN,
  })
  @IsNotEmpty()
  day: Days;

  @ApiProperty({
    description: 'Start time',
    example: '13.00',
  })
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    description: 'End time',
    example: '14.00',
  })
  @IsNotEmpty()
  end: string;
}
