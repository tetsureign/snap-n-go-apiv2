import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { DetectionService } from './detection.service';

@Controller('detect')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post()
  async detect(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const data = await this.detectionService.detect(file);
    return {
      success: true,
      data,
    };
  }
}
