import {
    Controller,
    Get,
    Patch,
    Post,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Body,
    UseInterceptors,
    UploadedFile,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UsersService } from "src/users/users.service";
import { HttpException } from "@nestjs/common/exceptions";
import { HttpStatus } from "@nestjs/common/enums";
import { RolesGuard } from "src/guards/roles.guard";
import { Role } from "./user.model";
import { Roles } from "src/decorators/roles.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import {
    ApiBearerAuth,
    ApiExcludeEndpoint,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
    GALLERY_IMG_PATH,
    METADATA_AUTHORIZED_KEY,
    PROFILE_IMG_PATH,
    UPLOADS_PATH,
} from "src/config";
import { Delete, Param, Res } from "@nestjs/common/decorators";
import { join } from "path";
import { createStorage } from "./helpers/uploads-storage";
import { UpdateUserDto } from "./dtos/UpdateUserDto.dto";
import * as fs from "fs";
import { FirebaseAdminService } from "src/firebase/firebase-admin.service";
import * as multer from "multer";

@ApiTags("users")
@Controller("users")
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get()
    @ApiExcludeEndpoint()
    async getUsers() {
        return await this.userService.fetchUsers();
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get beauty master personal profile" })
    @ApiBearerAuth(METADATA_AUTHORIZED_KEY)
    @ApiOkResponse({
        description: "User found",
    })
    @ApiNotFoundResponse({ description: "User not found" })
    @ApiInternalServerErrorResponse({
        description: "Server Error",
    })
    async getUserInfo(@Request() req) {
        const userId = req.user.userId;
        const userFound = await this.userService.getUserById(userId);
        if (!userFound) {
            throw new HttpException(
                "User not found",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return userFound;
    }

    @ApiExcludeEndpoint()
    @Get("masters")
    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOkResponse({
        description: "Users found",
    })
    @ApiNotFoundResponse({ description: "User not found" })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @ApiUnauthorizedResponse({
        description: "Unauthorized",
    })
    @ApiInternalServerErrorResponse({
        description: "Server Error",
    })
    async getMasters() {
        return await this.userService.fetchMasters();
    }

    @Get("masters/:id")
    @ApiOperation({ summary: "Get beauty master by ID" })
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({
        description: "User found",
    })
    @ApiNotFoundResponse({ description: "User not found" })
    async getMasterById(@Param("id") id: string) {
        return await this.userService.getUserById(id);
    }

    @Post("masters/near")
    @ApiOperation({ summary: "Get beauty masters in radius based on location" })
    @ApiOkResponse({
        description: "Users found",
    })
    @ApiForbiddenResponse({
        description: "Forbidden",
    })
    async getMastersNearMe(@Request() req) {
        const { lat, lng, radius, serviceTypes } = req.body;
        return await this.userService.fetchMastersByLocation(
            Number(lat),
            Number(lng),
            Number(radius),
            serviceTypes
        );
    }

    @Patch("update")
    @ApiOperation({ summary: "Update beauty master personal profile info" })
    @ApiForbiddenResponse({
        description: "Forbidden",
    })
    @ApiBearerAuth(METADATA_AUTHORIZED_KEY)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateMaster(@Request() req, @Body() userData: UpdateUserDto) {
        return await this.userService.updateUser(req.user.userId, userData);
    }

    @Post("upload")
    @ApiOperation({ summary: "Upload beauty master profile photo" })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth(METADATA_AUTHORIZED_KEY)
    @UseInterceptors(
        FileInterceptor("file", {
            limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
            fileFilter: (req, file, cb) => {
                const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
                allowedMimeTypes.includes(file.mimetype)
                    ? cb(null, true)
                    : cb(new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."), false);
            },
            storage: multer.memoryStorage(), // Store files in memory
        })
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        if (!file) {
            throw new HttpException(
                "File must be a png, jpg/jpeg",
                HttpStatus.BAD_REQUEST
            );
        }

        // Initialize Firebase Service
        const firebaseService = new FirebaseAdminService();

        // Get the current user's profile image URL
        const user = await this.userService.getUserById(req.user.userId);

        // Delete the previous profile image from Firebase Storage
        // if (user.profileImage) {
        //     const filePath = user.profileImage.split(`${user.projectId}.appspot.com/`)[1];
        //     await firebaseService.deleteFile(filePath);
        // }

        // Upload the new image to Firebase
        const publicUrl = await firebaseService.uploadFile(file);

        // Update the user's profile image with the Firebase URL
        return await this.userService.setUserProfileImage(
            req.user.userId,
            publicUrl
        );
    }

    // @Post("upload")
    // @UseGuards(JwtAuthGuard)
    // @UseInterceptors(
    //     FileInterceptor(
    //         "file",
    //         createStorage(`./${UPLOADS_PATH}${PROFILE_IMG_PATH}`)
    //     )
    // )
    // async uploadFile(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Request() req
    // ) {
    //     if (!file?.filename) {
    //         throw new HttpException(
    //             "File must be a png, jpg/jpeg",
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }

    //     // delete previous photo from storage
    //     const user = await this.userService.getUserById(req.user.userId);
    //     if (user.profileImage) {
    //         fs.unlinkSync(
    //             `./${UPLOADS_PATH}/${PROFILE_IMG_PATH}/${user.profileImage}`
    //         );
    //     }

    //     return await this.userService.setUserProfileImage(
    //         req.user.userId,
    //         file.filename
    //     );
    // }

    @Get("profile-image/:imageName")
    @ApiOperation({ summary: "Get beauty master profile photo" })
    @ApiOkResponse({
        description: "Image found",
    })
    async getProfileImage(@Param("imageName") imageName: string, @Res() res) {
        const filePath = join(
            process.cwd(),
            `${UPLOADS_PATH}${PROFILE_IMG_PATH}/` + imageName
        );
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found" });
            // Or return any appropriate error response you prefer
        }

        return res.sendFile(filePath);
    }


    @ApiExcludeEndpoint()
    @Get('gallery/:id')
    async getUserGallery(@Param() user) {
        return await this.userService.getUserGallery(user.id);
    }

    @Post("upload-gallery")
    @ApiExcludeEndpoint()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor(
            "file",
            createStorage(`./${UPLOADS_PATH}${GALLERY_IMG_PATH}`)
        )
    )
    async uploadToGallery(
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        if (!file?.filename) {
            throw new HttpException(
                "File must be a png, jpg/jpeg",
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.userService.addUserGalleryPhoto(
            req.user.userId,
            file.filename
        );
    }

   
    @Delete("delete-gallery")
    @ApiExcludeEndpoint()
    @UseGuards(JwtAuthGuard)
    async deleteFromGallery(@Request() req) {
        const img = req.body.image;
        if (img) {
            fs.unlinkSync(`./${UPLOADS_PATH}${GALLERY_IMG_PATH}/${img}`);
        }
        return await this.userService.deleteUserGalleryPhoto(
            req.user.userId,
            img
        );
    }

    @Get("gallery-image/:imageName")
    @ApiExcludeEndpoint()
    @ApiOkResponse({
        description: "Image found",
    })
    async getGalleryImage(@Param("imageName") imageName: string, @Res() res) {
        const filePath = join(
            process.cwd(),
            `${UPLOADS_PATH}${GALLERY_IMG_PATH}/` + imageName
        );

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found" });
            // Or return any appropriate error response you prefer
        }
        return res.sendFile(filePath);
    }
}
