import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MmdaController } from './mmda.controller';
import { MmdaService } from './mmda.service';

@Module({
  imports: [HttpModule],
  controllers: [MmdaController],
  providers: [MmdaService],
})
export class MmdaModule {}



