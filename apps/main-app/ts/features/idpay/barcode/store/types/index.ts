import { TransactionBarCodeResponse } from "@io-app/api-types/generated/definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "@io-app/api-types/generated/definitions/idpay/TransactionErrorDTO";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { NetworkError } from "../../../../../utils/errors";

export type IdPayBarcodeState = {
  [initiativeId: string]: pot.Pot<
    TransactionBarCodeResponse,
    NetworkError | TransactionErrorDTO
  >;
};

export type IdPayStaticCodeState = {
  [initiativeId: string]: pot.Pot<
    TransactionBarCodeResponse,
    NetworkError | TransactionErrorDTO
  >;
};
