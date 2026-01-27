import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { MultipartFile } from '@fastify/multipart';

@Injectable()
export class DetectionService {
  private yoloUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.yoloUrl = this.configService.get<string>('YOLO_SERVICE_URL')!;
  }

  async detect(file: MultipartFile) {
    try {
      const formData = new FormData();
      formData.append('file', file.file, {
        filename: file.filename,
        contentType: file.mimetype,
      });

      const { data } = await firstValueFrom(
        this.httpService.post<unknown>(
          `${this.yoloUrl}/images/detect`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        ),
      );

      return data;
    } catch (error) {
      console.error('Yolo Service Error:', error);
      throw new InternalServerErrorException(
        'Error sending image to microservice',
      );
    }
  }
}
