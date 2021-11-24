import { CountryInfos } from '../../../utils';
import { Availability, IceType, Locations } from '../../../types';

const hasIceType = (
  outrageProductList: string[],
  productsToCheck: string[],
) => {
  if (productsToCheck.length === 0) {
    return Availability.NOT_AVAILABLE;
  }
  if (productsToCheck.includes('UNAVAILABLE')) {
    return Availability.NOT_APPLICABLE;
  }

  let hasProducts = Availability.AVAILABLE;

  productsToCheck.forEach((product) => {
    if (outrageProductList.includes(product)) {
      hasProducts = Availability.NOT_AVAILABLE;
    }
  });

  return hasProducts;
};

export const hasProduct: Record<
  IceType,
  (outrageProductList: string[], location: Locations) => Availability
> = {
  [IceType.MCFLURRY]: (outrageProductList, location) =>
    hasIceType(
      outrageProductList,
      CountryInfos[location].productCodes.MCFLURRY,
    ),
  [IceType.MCSUNDAE]: (outrageProductList, location) =>
    hasIceType(
      outrageProductList,
      CountryInfos[location].productCodes.MCSUNDAE,
    ),
  [IceType.MILCHSHAKE]: (outrageProductList, location) =>
    hasIceType(
      outrageProductList,
      CountryInfos[location].productCodes.MILCHSHAKE,
    ),
};
