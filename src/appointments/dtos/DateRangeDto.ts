import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date in format mm/dd/yyyy',
    example: '01/01/2022',
  })
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    description: 'End date in format mm/dd/yyyy',
    example: '01/01/2023',
  })
  @IsNotEmpty()
  end: string;
}
