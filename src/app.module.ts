import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServiceTypesModule } from './service-types/service-types.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forRoot(
      'mongodb+srv://mariia-kovalenko:mariia-kovalenko@cluster0.8valkdh.mongodb.net/?retryWrites=true&w=majority',
    ),
    AuthModule,
    SchedulesModule,
    AppointmentsModule,
    ServiceTypesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
