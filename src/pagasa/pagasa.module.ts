import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PagasaController } from './pagasa.controller';
import { PagasaService } from './pagasa.service';

@Module({
  imports: [HttpModule],
  controllers: [PagasaController],
  providers: [PagasaService],
})
export class PagasaModule {}



