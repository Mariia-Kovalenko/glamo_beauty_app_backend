import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

class Location {
  @ApiProperty({
    example: '50.34567890',
  })
  lat: string;

  @ApiProperty({
    example: '30.34567890',
  })
  lng: string;
}

export class AddressDto {
  @ApiProperty({
    description: 'User`s address string',
    example: 'Kolltsova boul., 14, Kyiv, Ukraine',
  })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'User`s location object (lattitude and longtitude)',
    type: Location,
  })
  @IsNotEmpty()
  location: {
    lat: string;
    lng: string;
  };
}
