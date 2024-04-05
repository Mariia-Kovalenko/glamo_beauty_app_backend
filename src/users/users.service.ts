import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ServiceTypesService } from "src/service-types/service-types.service";
import { User, Role } from "src/users/user.model";

@Injectable()
export class UsersService {
    constructor(
        private serviceTypesService: ServiceTypesService,
        @InjectModel("User") private readonly userModel: Model<User>
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
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        if (!userFound) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return {
            id: userFound._id,
            username: userFound.username,
            phone: userFound.phone,
            email: userFound.email,
            role: userFound.role,
            address: userFound.address,
            profileImage: userFound.profileImage,
            services: userFound.services,
            gallery: userFound.gallery
        };
    }

    async findOne(email: string) {
        let userFound;
        try {
            userFound = await this.userModel.findOne({ email: email });
        } catch (error) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        if (!userFound) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return {
            username: userFound.username,
            role: userFound.role,
            id: String(userFound._id),
            password: userFound.password,
            profileImage: userFound.profileImage,
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
                throw new HttpException("Not found", HttpStatus.NOT_FOUND);
            }
            return masters;
        } catch (error) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }
    }

    async fetchMastersByLocation(
        lat: number,
        lng: number,
        radius: number,
        serviceTypes: string[]
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
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }
    }

    async updateUser(
        userId: string,
        body: {
            username: string;
            email: string;
            phone: string;
            address: string;
            location: { lat: string; lng: string };
            services: string[];
        }
    ) {
        try {
            let location;

            if (body.location) {
                location = {
                    type: "Point",
                    coordinates: [body.location.lng, body.location.lat],
                };
            }

            return await this.userModel.findByIdAndUpdate(
                userId,
                {
                    $set: { ...body, location }
                },
                { new: true }
            );
        } catch (error) {
            throw new HttpException(error.message, error.statusCode);
        }
    }

    async setUserProfileImage(userId: string, profileImage: string) {
        try {
            const userUpdated = await this.userModel.findByIdAndUpdate(userId, {
                profileImage,
            });

            return userUpdated;
        } catch (error) {
            throw new HttpException(
                "Server error",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getUserGallery(id: string) {
        let userFound;
        try {
            userFound = await this.userModel.findById(id);
        } catch (error) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        if (!userFound) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return {
            gallery: userFound.gallery
        }
    }

    async addUserGalleryPhoto(userId: string, image: string) {
        try {
            const userUpdated = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    $push: { gallery: image}
                },
                { new: true })

                return userUpdated;
        } catch (error) {
            throw new HttpException(
                "Server error",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async deleteUserGalleryPhoto(userId: string, image: string) {
        try {
            const userUpdated = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    $pull: { gallery: image}
                },
                { new: true })

                return userUpdated;
        } catch (error) {
            throw new HttpException(
                "Server error",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
