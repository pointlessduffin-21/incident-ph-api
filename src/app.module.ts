import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcledModule } from './acled/acled.module';
import { AppController } from './app.controller';
import { MmdaModule } from './mmda/mmda.module';
import { PagasaModule } from './pagasa/pagasa.module';
import { PhivolcsModule } from './phivolcs/phivolcs.module';

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
  ],
  controllers: [AppController],
})
export class AppModule {}



