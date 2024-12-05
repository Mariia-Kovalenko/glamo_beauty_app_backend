import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from 'src/users/user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { BASE_URL, HOSTED_URL, RESET_PASSWORD } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async createUser(
    username: string,
    email: string,
    password: string,
    role: Role,
  ) {
    const userExists = await this.userModel.findOne({ email: email });
    if (userExists) {
      throw new HttpException(
        'User with such email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPass,
      role,
    });
    const result = await newUser.save();
    return { id: result._id, username: result.username, email: result.email };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const match = await bcrypt.compare(pass, user.password);

    if (user && match) {
      const { password, ...result } = user;
      return result;
    }

    if (!match) {
      throw new HttpException('Incorrect credentials', HttpStatus.FORBIDDEN);
    }
    return null;
  }

  async login(email: string, password: string) {
    const userValidated = await this.validateUser(email, password);
    const payload = {
      email: email,
      role: userValidated.role,
      profileImage: userValidated.profileImage,
      sub: userValidated.id,
    };

    if (!userValidated) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    if (userValidated) {
      return {
        id: userValidated.id,
        username: userValidated.username,
        role: userValidated.role,
        profileImage: userValidated.profileImage,
        access_token: this.jwtService.sign(payload),
      };
    }
  }

  async resetPassword(email: string) {
    const foundUser = await this.userModel.findOne({ email: email });

    if (!foundUser) {
      throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
    }

    // create temporary secret to be sent to email
    const secret = process.env.ACCESS_TOKEN_SECRET + foundUser.password;

    // create new token
    const token = jwt.sign(
      {
        _id: foundUser._id,
        role: foundUser.role,
      },
      secret,
      { expiresIn: '10m' },
    );
    return `${HOSTED_URL}${RESET_PASSWORD}${foundUser._id}/${token}`;
  }

  async setNewPassword(id, password, token) {
    const foundUser = await this.userModel.findById(id);

    if (!foundUser) {
      throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
    }

    // generate secret and verify token
    const secret = process.env.ACCESS_TOKEN_SECRET + foundUser.password;

    try {
      const verified = jwt.verify(token, secret);
      const hashedPass = await bcrypt.hash(password, 10);

      const updatedUser = await this.userModel.findByIdAndUpdate(id, {
        password: hashedPass,
      });
      if (!updatedUser) {
        throw new HttpException(
          'Server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async verifyUser(id: string, token: string) {
    const foundUser = await this.userModel.findById(id);

    if (!foundUser) {
      throw new HttpException('User Not found', HttpStatus.NOT_FOUND);
    }

    // generate secret and verify token
    const secret = process.env.ACCESS_TOKEN_SECRET + foundUser.password;
    const verified = jwt.verify(token, secret);

    if (!verified) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return {
      email: foundUser.email,
    };
  }
}
