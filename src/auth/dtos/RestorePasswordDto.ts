import { IsNotEmpty } from 'class-validator';

export class RestorePasswordDto {
  @IsNotEmpty()
  password: string;
}