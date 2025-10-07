import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AcledController } from './acled.controller';
import { AcledService } from './acled.service';

@Module({
  imports: [HttpModule],
  controllers: [AcledController],
  providers: [AcledService],
})
export class AcledModule {}
