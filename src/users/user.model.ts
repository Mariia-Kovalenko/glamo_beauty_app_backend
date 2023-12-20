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

const ServicesSubSchema = new mongoose.Schema({
  value: {
    type: String,
    enum: [
      ServiceTypes.MAKEUP,
      ServiceTypes.BROWS,
      ServiceTypes.COSMETOLOGY,
      ServiceTypes.HAIR,
      ServiceTypes.MASSAGE,
      ServiceTypes.NAILS,
    ],
  },
});

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
  phone: { type: String, required: false },
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
  services: [{ type: String, refs: ServicesSubSchema }],
  gallery: [{type: String}]
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
  services?: string[],
  gallery?: string[]
}
