import 'fastify';
import { MultipartFile } from '@fastify/multipart';

declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
    file(): Promise<MultipartFile | undefined>;
    isMultipart(): boolean;
  }
}
