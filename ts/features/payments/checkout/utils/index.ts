import _ from "lodash";
import { ZendeskSubCategoriesMap } from "../../../../../definitions/content/ZendeskSubCategoriesMap";
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

export const PAYMENT_STEPS_TOTAL_PAGES = 4;

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
  if (!pspList || pspList.length === 0) {
    return "none";
  }
  if (psp.onUs) {
    return "customer";
  }
  if (pspList.length === 1) {
    return "unique";
  }
  const fees = pspList
    .map(p => p.taxPayerFee)
    .filter((fee): fee is number => typeof fee === "number");
  const minFee = Math.min(...fees);
  return psp.taxPayerFee === minFee ? "cheaper" : "none";
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

export const formatAndValidateDueDate = (date: string): string | undefined => {
  const formattedDate = format(date, "DD/MM/YYYY");
  if (formattedDate === "Invalid Date") {
    return undefined;
  }
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + YEARS_TO_EXPIRE);
  return new Date(date) > tenYearsFromNow ? undefined : formattedDate;
};

export const getSubCategoryFromFaultCode = (
  data: ZendeskSubCategoriesMap,
  statusCode: string
) => {
  // check if there is a subcategory array that includes passed element
  const subcategoryKey = Object.keys(data.subcategories).find(key =>
    data.subcategories[key].includes(statusCode)
  );
  // if there is, return the mapped subcategory with the zendesk category id
  if (subcategoryKey) {
    return {
      value: subcategoryKey,
      zendeskSubCategoryId: data.subcategoryId
    };
  }
  // if not, return nullable
  return null;
};

export const CHECKOUT_ASSISTANCE_ARTICLE =
  "https://assistenza.ioapp.it/hc/it/articles/31007989155985-L-avviso-pagoPA-%C3%A8-revocato";
