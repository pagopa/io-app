import * as t from "io-ts";

import { WalletPaymentFailure } from "./failure";

export const WalletConfiguration = t.partial({
  verificationFailure: WalletPaymentFailure,
  activationFailure: WalletPaymentFailure
});

export type WalletConfiguration = t.TypeOf<typeof WalletConfiguration>;
