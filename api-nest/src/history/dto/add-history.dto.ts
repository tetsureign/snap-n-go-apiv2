import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const addHistorySchema = z.object({
  query: z.string().min(1, 'Search query is required.'),
});

export class AddHistoryDto extends createZodDto(addHistorySchema) {}
