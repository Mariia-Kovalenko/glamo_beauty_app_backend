import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServiceDto } from './dtos/ServiceDto';
import { ServiceTypesService } from './service-types.service';

@ApiTags('service types')
@Controller('service-types')
export class ServiceTypesController {
  constructor(private serviceTypeService: ServiceTypesService) {}

  @Get(':typeId')
  async getServiceTypes(@Param('typeId') typeId: string) {
    return await this.serviceTypeService.findService(typeId);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async addService(@Body() serviceData: ServiceDto) {
    return await this.serviceTypeService.createService(
      serviceData.typeId,
      serviceData.name,
    );
  }
}
