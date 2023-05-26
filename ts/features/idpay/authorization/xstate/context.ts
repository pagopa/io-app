import { SyncTrxStatus } from "../../../../../definitions/idpay_payment/SyncTrxStatus";

export type Context = {
  transactionId?: string;
  transaction?: SyncTrxStatus;
};
