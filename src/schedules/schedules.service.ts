import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Schedule } from './schedule.model';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel('Schedule') private readonly scheduleModel: Model<Schedule>,
  ) {}

  async getUserSchedule(userId: string) {
    try {
      const scheduleFound = await this.scheduleModel.findOne({ userId });

      if (!scheduleFound) {
        throw new HttpException('No schedule found', HttpStatus.NOT_FOUND);
      }

      return scheduleFound;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async setOpeningHours(
    userId: string,
    day: string,
    start: string,
    end: string,
  ) {
    let scheduleExists = false;
    try {
      scheduleExists = await this.scheduleModel.findOne({ userId });

      if (!scheduleExists) {
        const scheduleCreated = new this.scheduleModel({
          userId: userId,
          [day]: { start, end },
        });
        const result = await scheduleCreated.save();
        return result;
      }
    } catch (error) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const scheduleTimeFound = scheduleExists[day].find(
      (time) => time.start === start || time.end === end,
    );

    if (scheduleTimeFound) {
      throw new HttpException(
        'Time already exists on schedule',
        HttpStatus.CONFLICT,
      );
    }

    try {
      const scheduleUpdated = await this.scheduleModel.findOneAndUpdate(
        { userId },
        { $push: { [day]: { start, end } } },
        {
          new: true,
        },
      );
      return scheduleUpdated;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }
}
