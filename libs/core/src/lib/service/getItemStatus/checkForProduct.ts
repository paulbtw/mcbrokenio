import { ItemStatus } from '@prisma/client';

export function checkForProduct(
  outrageProductList: string[],
  items: string[],
): {
  status: ItemStatus;
  count: number;
  unavailable: number;
} {
  const count = items.length;
  let unavailable = 0;

  if (items.length === 0) {
    return {
      status: ItemStatus.UNAVAILABLE,
      count,
      unavailable,
    };
  }

  if (items.includes('UNAILABLE')) {
    return {
      status: ItemStatus.NOT_APPLICABLE,
      count,
      unavailable,
    };
  }

  items.forEach((item) => {
    if (outrageProductList.includes(item)) {
      unavailable++;
    }
  });

  let status: ItemStatus = ItemStatus.AVAILABLE;

  if (unavailable === count) {
    status = ItemStatus.UNAVAILABLE;
  } else if (unavailable > 0) {
    status = ItemStatus.PARTIAL_AVAILABLE;
  }

  return {
    status,
    count,
    unavailable,
  };
}
