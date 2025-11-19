import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WindyController } from './windy.controller';
import { WindyService } from './windy.service';

@Module({
  imports: [HttpModule],
  controllers: [WindyController],
  providers: [WindyService],
  exports: [WindyService],
})
export class WindyModule {}


