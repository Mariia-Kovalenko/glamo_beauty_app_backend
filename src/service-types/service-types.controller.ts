import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceDto } from './dtos/ServiceDto';
import { ServiceTypesService } from './service-types.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private serviceTypeService: ServiceTypesService) {}

  @Get()
  @ApiExcludeEndpoint()
  async getAllServices() {
    return await this.serviceTypeService.getServices();
  }

  @Get(':typeId')
  @ApiExcludeEndpoint()
  async getServiceTypes(@Param('typeId') typeId: string) {
    return await this.serviceTypeService.findService(typeId);
  }

  @Post()
  @ApiExcludeEndpoint()
  @UsePipes(new ValidationPipe())
  async addService(@Body() serviceData: ServiceDto) {
    return await this.serviceTypeService.createService(
      serviceData.typeId,
      serviceData.name,
    );
  }
}
