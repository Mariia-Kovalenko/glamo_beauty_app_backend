import { Module } from '@nestjs/common';
import { ServiceTypesController } from './service-types.controller';
import { ServiceTypesService } from './service-types.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceSchema } from './service.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Service', schema: ServiceSchema }]),
  ],
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService],
  exports: [ServiceTypesModule, ServiceTypesService],
})
export class ServiceTypesModule {}
