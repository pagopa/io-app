import _ from "lodash";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodManagementTypeEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodManagementType";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { PaymentMethodStatusEnum } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { format } from "../../../../utils/dates";
import {
  PaymentAnalyticsPhase,
  PaymentAnalyticsSelectedPspFlag
} from "../../common/types/PaymentAnalytics";
import { WalletPaymentStepEnum } from "../types";

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

const YEARS_TO_EXPIRE = 10;

export const isDueDateValid = (date: string): string | undefined => {
  const formattedDate = format(date, "DD/MM/YYYY");
  if (formattedDate === "Invalid Date") {
    return undefined;
  }
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + YEARS_TO_EXPIRE);
  return new Date(date) > tenYearsFromNow ? undefined : formattedDate;
};
