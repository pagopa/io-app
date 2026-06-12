import { IOBarcode } from "../types/IOBarcode";

/**
 * Removes duplicates from an array of barcodes. It uses JSON.stringify to compare the objects.
 * This should work because IOBarcode is created every time from the same decoder function,
 * so data is always in the same order.
 * @param barcodes Array of barcodes
 * @returns Array of barcodes without duplicates
 */
export const getUniqueBarcodes = (
  barcodes: Array<IOBarcode>
): Array<IOBarcode> =>
  barcodes.filter((value, index) => {
    const stringValue = JSON.stringify(value);
    return (
      index === barcodes.findIndex(obj => JSON.stringify(obj) === stringValue)
    );
  });
