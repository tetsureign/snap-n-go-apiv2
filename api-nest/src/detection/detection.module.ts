import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [DetectionService],
  controllers: [DetectionController],
})
export class DetectionModule {}
