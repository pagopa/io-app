import * as pot from "@pagopa/ts-commons/lib/pot";

import { TransactionBarCodeResponse } from "../../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../../definitions/idpay/TransactionErrorDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayBarcodeState = Record<
  string,
  pot.Pot<TransactionBarCodeResponse, NetworkError | TransactionErrorDTO>
>;

export type IdPayStaticCodeState = Record<
  string,
  pot.Pot<TransactionBarCodeResponse, NetworkError | TransactionErrorDTO>
>;
