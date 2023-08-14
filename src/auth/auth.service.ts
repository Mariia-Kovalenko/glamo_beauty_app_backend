import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from 'src/users/user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

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
        username: userValidated.username,
        role: userValidated.role,
        profileImage: userValidated.profileImage,
        access_token: this.jwtService.sign(payload),
      };
    }
  }
}
