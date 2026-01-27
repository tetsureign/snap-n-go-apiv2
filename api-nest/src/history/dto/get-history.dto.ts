import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getHistorySchema = z.object({
  limit: z.coerce.number().min(1).max(100),
  cursor: z.string().uuid().optional(),
});

export class GetHistoryDto extends createZodDto(getHistorySchema) {}
