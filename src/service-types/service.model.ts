import * as mongoose from 'mongoose';

export const ServiceSchema = new mongoose.Schema({
  typeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export interface Service {
  _id: string;
  typeId: string;
  name: string;
}
