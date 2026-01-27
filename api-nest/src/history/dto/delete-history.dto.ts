import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const deleteHistorySchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required.'),
});

export class DeleteHistoryDto extends createZodDto(deleteHistorySchema) {}
