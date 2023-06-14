import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from 'src/service-types/service.model';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectModel('Service') private readonly serviceModel: Model<Service>,
  ) {}

  async createService(typeId: string, name: string) {
    const serviceExists = await this.serviceModel.findOne({ typeId });

    if (serviceExists) {
      throw new HttpException('Service already exists', HttpStatus.BAD_REQUEST);
    }

    const newService = new this.serviceModel({
      typeId,
      name,
    });

    return await newService.save();
  }

  async getServices() {
    try {
      return await this.serviceModel.find();
    } catch (error) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async findService(typeId: string) {
    let serviceFound;
    try {
      serviceFound = await this.serviceModel.findOne({ typeId });
    } catch (error) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }

    if (!serviceFound) {
      throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
    }
    return serviceFound;
  }
}
