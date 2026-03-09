import * as pot from "@pagopa/ts-commons/lib/pot";
import { TransactionBarCodeResponse } from "../../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../../definitions/idpay/TransactionErrorDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayBarcodeState = {
  [initiativeId: string]: pot.Pot<
    TransactionBarCodeResponse,
    TransactionErrorDTO | NetworkError
  >;
};

export type IdPayStaticCodeState = {
  [initiativeId: string]: pot.Pot<
    TransactionBarCodeResponse,
    TransactionErrorDTO | NetworkError
  >;
};
