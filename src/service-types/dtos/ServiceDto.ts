import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
  @ApiProperty({
    example: '1',
  })
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({
    example: 'Makeup',
  })
  @IsNotEmpty()
  name: string;
}
