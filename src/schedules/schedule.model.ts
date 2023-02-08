import mongoose from 'mongoose';

export enum Days {
  MON = 'mon',
  TUE = 'tue',
  WED = 'wed',
  THU = 'thu',
  FRI = 'fri',
  SAT = 'sat',
  SUN = 'sun',
}

export const ScheduleSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  [Days.SUN]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.MON]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.TUE]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.WED]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.THU]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.FRI]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
  [Days.SAT]: [
    {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
  ],
});

export interface Schedule {
  _id: string;
  userId: string;
  [Days.SUN]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.MON]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.TUE]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.WED]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.THU]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.FRI]: [
    {
      start: string;
      end: string;
    },
  ];
  [Days.SAT]: [
    {
      start: string;
      end: string;
    },
  ];
}
