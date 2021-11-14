import { IceType } from '../types';

const hasIceType = (outrageProductList: string[], productsToCheck: string[]) => {
  let hasProducts = true;

  productsToCheck.forEach((product) => {
    if (outrageProductList.includes(product)) {
      hasProducts = false;
    }
  });

  return hasProducts;
};

export const hasProduct: Record<IceType, (outrageProductList: string[]) => boolean> = {
  [IceType.MCFLURRY]: (outrageProductList) => hasIceType(outrageProductList, ['4237', '4252', '4255', '4256', '4258']),
  [IceType.MCSUNDAE]: (outrageProductList) => hasIceType(outrageProductList, ['4603', '4604', '4651']),
  [IceType.MILCHSHAKE]: (outrageProductList) => hasIceType(outrageProductList, ['5000', '5010', '5020']),
};
