import { TransactionBarCodeResponse } from "../../../../definitions/idpay/TransactionBarCodeResponse";

export const calculateIdPayBarcodeSecondsToExpire = (
  barcode: TransactionBarCodeResponse
) => {
  const expireDateEpoch =
    barcode.trxDate.getTime() + barcode.trxExpirationSeconds * 1000;
  // needs floor to avoid floating point problems
  const secondsToExpire = Math.floor(
    (expireDateEpoch - new Date().getTime()) / 1000
  );
  // make sure no negative is returned
  return Math.max(0, secondsToExpire);
};
