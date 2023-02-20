import * as mongoose from 'mongoose';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  MASTER = 'MASTER',
}

export enum ServiceTypes {
  MAKEUP = '1',
  HAIR = '2',
  NAILS = '3',
  BROWS = '4',
  COSMETOLOGY = '5',
  MASSAGE = '6',
}

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [Role.CUSTOMER, Role.MASTER],
    required: true,
  },
  address: { type: String, required: false },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  profileImage: { type: String },
});

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  location: {
    coordinates: number[];
  };
  profileImage?: string;
}
