import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Days } from '../schedule.model';

export class ScheduleDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: Days,
    example: Days.MON,
  })
  @IsNotEmpty()
  day: string;

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
