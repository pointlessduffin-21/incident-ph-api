import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcledModule } from './acled/acled.module';
import { AppController } from './app.controller';
import { MmdaModule } from './mmda/mmda.module';
import { OpenWeatherModule } from './openweather/openweather.module';
import { PagasaModule } from './pagasa/pagasa.module';
import { PhivolcsModule } from './phivolcs/phivolcs.module';
import { QWeatherModule } from './qweather/qweather.module';
import { TideModule } from './tide/tide.module';
import { TyphoonModule } from './typhoon/typhoon.module';
import { WindyModule } from './windy/windy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
    }),
    HttpModule,
    MmdaModule,
    PagasaModule,
    PhivolcsModule,
    AcledModule,
    TyphoonModule,
    TideModule,
    OpenWeatherModule,
    WindyModule,
    QWeatherModule,
  ],
  controllers: [AppController],
})
export class AppModule {}



