import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, Role } from 'src/users/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  isInRadius(
    currLat: number,
    currLng: number,
    destinLat: number,
    destinLng: number,
    r: number,
  ) {
    const earthRad = 6371;
    return (
      Math.acos(
        Math.sin(currLat) * Math.sin(destinLat) +
          Math.cos(currLat) *
            Math.cos(destinLat) *
            Math.cos(destinLng - currLng),
      ) *
        earthRad <=
      r
    );
  }

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

  async fetchMastersByLocation() {
    let masters;
    const earthRad = 6371;
    try {
      masters = await this.userModel.find({
        $where: function () {
          console.log(this);
          return this.role === 'MASTER';
        },
      });
      console.log('masters', masters);
      return {};
    } catch (error) {
      console.log(error);

      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async setUserAddress(
    userId: string,
    address: string,
    location?: { lat: string; lng: string },
  ) {
    try {
      return await this.userModel.findByIdAndUpdate(
        userId,
        {
          address,
          location,
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
}
