import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail } from "class-validator";
import { Role } from "../user.model";

class Location {
    @ApiProperty({
        example: "50.34567890",
    })
    lat: string;

    @ApiProperty({
        example: "30.34567890",
    })
    lng: string;
}

export class UpdateUserDto {
    @ApiProperty({
        description: "Username",
        example: "John",
    })
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: "Email",
        example: "john@email.com",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "Phone",
        example: "+1234567",
    })
    phone: string;

    @ApiProperty({
        description: "User`s address string",
        example: "Kolltsova boul., 14, Kyiv, Ukraine",
    })
    address: string;

    @ApiProperty({
        description: "User`s location object (lattitude and longtitude)",
        type: Location,
    })
    location: {
        lat: string;
        lng: string;
    };

    @ApiProperty({
        description: "Master`s services list",
        example: ['1', '2', '3'],
    })
    services: string[];
}
