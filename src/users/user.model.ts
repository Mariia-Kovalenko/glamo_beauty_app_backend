import * as mongoose from 'mongoose';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  MASTER = 'MASTER',
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
    lat: { type: String },
    lng: { type: String },
  },
  profileImage: { type: String },
});

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  profileImage?: string;
}
