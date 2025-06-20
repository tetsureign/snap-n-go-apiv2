export async function softDelete<T extends { deletedAt?: Date }>(
  model: { updateMany: Function },
  where: Record<string, any>
): Promise<boolean> {
  const result = await model.updateMany({
    where: { ...where, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return result.count > 0;
}

export async function restore<T extends { deletedAt?: Date }>(
  model: { updateMany: Function },
  where: Record<string, any>
): Promise<boolean> {
  const result = await model.updateMany({
    where: { ...where, deletedAt: { not: null } },
    data: { deletedAt: null },
  });

  return result.count > 0;
}
