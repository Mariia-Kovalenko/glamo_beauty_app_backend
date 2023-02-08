import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Days, Schedule } from 'src/schedules/schedule.model';
import { Model } from 'mongoose';
import { Appointment, Status } from './appointment.model';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
  ) {}

  async getAppointmentsBetweenDates(
    masterId: string,
    startDate: string,
    endDate: string,
  ) {
    try {
      const appointments = await this.appointmentModel.find({
        masterId,
        date: { $gte: new Date(startDate), $lt: new Date(endDate) },
      });
      return appointments;
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAppointment(
    customerId: string,
    masterId: string,
    date: string,
    day: Days,
    start: string,
    end: string,
  ) {
    const appointmentExists = await this.appointmentModel.findOne({
      customerId,
      masterId,
      date,
      day,
      start,
      end,
      status: Status.NEW,
    });

    if (appointmentExists) {
      throw new HttpException(
        'Appointment already exists',
        HttpStatus.CONFLICT,
      );
    }

    // check if time is available on schedule
    const timeOnSchedule = await this.scheduleModel.findOne({
      userId: masterId,
    });

    const timeSlot = timeOnSchedule[day].find(
      (time) => time.start === start && time.end === end,
    );

    if (!timeSlot) {
      throw new HttpException('Time is not on schedule', HttpStatus.CONFLICT);
    }

    try {
      const appointmentCreated = new this.appointmentModel({
        customerId,
        masterId,
        date: new Date(date),
        day,
        start,
        end,
      });
      return await appointmentCreated.save();
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelAppointment(id: string) {
    try {
      const appointment = await this.appointmentModel.findById(id);
      if (!appointment) {
        throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
      }
      return await this.appointmentModel.findByIdAndUpdate(
        id,
        {
          status: Status.CANCELLED,
        },
        { new: true },
      );
    } catch (error) {
      throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
