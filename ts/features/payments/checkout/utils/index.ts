import _ from "lodash";
import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { WalletPaymentStepEnum } from "../types";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import {
  PaymentAnalyticsPhase,
  PaymentAnalyticsSelectedPspFlag
} from "../../common/types/PaymentAnalytics";

export const WALLET_PAYMENT_SHOW_OTHER_CHANNELS_URL =
  "https://www.pagopa.gov.it/it/cittadini/dove-pagare/";

export const isValidPaymentMethod = (method: PaymentMethodResponse) =>
  [
    PaymentMethodManagementTypeEnum.ONBOARDABLE,
    PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE,
    PaymentMethodManagementTypeEnum.ONBOARDABLE_WITH_PAYMENT,
    PaymentMethodManagementTypeEnum.REDIRECT
  ].includes(method.methodManagement) &&
  method.status === PaymentMethodStatusEnum.ENABLED;

export const WalletPaymentStepScreenNames = {
  [WalletPaymentStepEnum.PICK_PAYMENT_METHOD]: "PICK_PAYMENT_METHOD",
  [WalletPaymentStepEnum.PICK_PSP]: "PICK_PSP",
  [WalletPaymentStepEnum.CONFIRM_TRANSACTION]: "CONFIRM_TRANSACTION"
};

export const getPspFlagType = (
  psp: Bundle,
  pspList?: ReadonlyArray<Bundle>
): PaymentAnalyticsSelectedPspFlag => {
  if (!pspList) {
    return "none";
  }
  if (psp.onUs) {
    return "customer";
  }
  if (pspList.length === 1) {
    return "unique";
  }
  const cheaperPsp = _.orderBy(pspList, psp => psp.taxPayerFee)[0];
  return cheaperPsp.idBundle === psp.idBundle ? "cheaper" : "none";
};

export const getPaymentPhaseFromStep = (
  step: WalletPaymentStepEnum
): PaymentAnalyticsPhase => {
  switch (step) {
    case WalletPaymentStepEnum.PICK_PAYMENT_METHOD:
      return "attiva";
    case WalletPaymentStepEnum.PICK_PSP:
      return "attiva";
    case WalletPaymentStepEnum.CONFIRM_TRANSACTION:
      return "pagamento";
    default:
      return "verifica";
  }
};

export const trimAndLimitValue = (value: string, maxLength: number): string => {
  const trimmedValue = value.replace(/\s/g, "");
  return trimmedValue.length > maxLength
    ? trimmedValue.substring(0, maxLength)
    : trimmedValue;
};
