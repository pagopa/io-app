import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { WalletClientStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletClientStatus";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";

export const WALLET_PAYMENT_FEEDBACK_URL =
  "https://io.italia.it/diccilatua/ces-pagamento";

export const isValidPaymentMethod = (method: PaymentMethodResponse) =>
  [
    PaymentMethodManagementTypeEnum.ONBOARDABLE,
    PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT,
    PaymentMethodManagementTypeEnum.REDIRECT
  ].includes(method.methodManagement) &&
  method.status === PaymentMethodStatusEnum.ENABLED;

export const getLatestUsedWallet = (
  wallets: ReadonlyArray<WalletInfo>
): O.Option<WalletInfo> =>
  pipe(
    wallets,
    RA.filter(
      wallet => wallet.clients.IO.status === WalletClientStatusEnum.ENABLED
    ),
    RA.reduce<WalletInfo, WalletInfo | undefined>(undefined, (acc, curr) =>
      acc?.clients.IO?.lastUsage &&
      curr.clients.IO?.lastUsage &&
      acc.clients.IO.lastUsage > curr.clients.IO.lastUsage
        ? acc
        : curr
    ),
    O.fromNullable
  );
