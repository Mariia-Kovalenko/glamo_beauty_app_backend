import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServiceTypesService } from 'src/service-types/service-types.service';
import { User, Role } from 'src/users/user.model';

@Injectable()
export class UsersService {
  constructor(
    private serviceTypesService: ServiceTypesService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async fetchUsers() {
    const users = await this.userModel.find().exec();
    return users;
  }

  async getUserById(id: string) {
    let userFound;
    try {
      userFound = await this.userModel.findById(id);
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!userFound) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      address: userFound.address,
      profileImage: userFound.profileImage,
    };
  }

  async findOne(email: string) {
    let userFound;
    try {
      userFound = await this.userModel.findOne({ email: email });
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!userFound) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      username: userFound.username,
      role: userFound.role,
      id: String(userFound._id),
      password: userFound.password,
    };
  }

  async fetchMasters() {
    let masters;
    try {
      masters = await this.userModel.find({
        role: Role.MASTER,
        location: { $exists: true },
      });
      if (!masters) {
        throw new HttpException('Not found', HttpStatus.NOT_FOUND);
      }
      return masters;
    } catch (error) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async fetchMastersByLocation(
    lat: number,
    lng: number,
    radius: number,
    serviceTypes: string[],
  ) {
    const kmToRadian = function (miles: number) {
      const earthRadiusInKm = 6378;
      return miles / earthRadiusInKm;
    };
    const query = {
      services: {
        $in: serviceTypes,
      },
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], kmToRadian(radius)],
        },
      },
    };
    try {
      const res = await this.userModel.find(query);
      return res;
    } catch (error) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async setUserAddress(
    userId: string,
    address: string,
    location?: { lat: string; lng: string },
  ) {
    try {
      const coordinates = {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      };
      return await this.userModel.findByIdAndUpdate(
        userId,
        {
          address,
          location: coordinates,
        },
        { new: true },
      );
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setUserProfileImage(userId: string, profileImage: string) {
    try {
      const userUpdated = await this.userModel.findByIdAndUpdate(userId, {
        profileImage,
      });
      console.log(userUpdated);

      return userUpdated;
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addUserServiceTypes(userId: string, typeId: string) {
    try {
      // check if there is a service with such typeId
      const serviceTypeExists = await this.serviceTypesService.findService(
        typeId,
      );

      if (!serviceTypeExists) {
        throw new Error('Service type not found');
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    try {
      return await this.userModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            services: typeId,
          },
        },
        { new: true },
      );
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
