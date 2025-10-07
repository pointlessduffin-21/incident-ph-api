import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PhivolcsController } from './phivolcs.controller';
import { PhivolcsService } from './phivolcs.service';

@Module({
  imports: [HttpModule],
  controllers: [PhivolcsController],
  providers: [PhivolcsService],
})
export class PhivolcsModule {}



