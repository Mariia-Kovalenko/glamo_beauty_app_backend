import mongoose from 'mongoose';
import { Days } from 'src/schedules/schedule.model';

export enum Status {
  NEW = 'NEW',
  CANCELLED = 'CANCELLED',
}

export const AppointmentSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  masterId: { type: String, required: true },
  date: { type: Date, required: true },
  day: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  status: {
    type: String,
    enum: [Status.NEW, Status.CANCELLED],
    default: Status.NEW,
  },
});

export interface Appointment {
  customerId: string;
  masterId: string;
  date: Date;
  day: Days;
  start: string;
  end: string;
  status: Status;
}
