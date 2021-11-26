import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";
import I18n from "../i18n";

// return the email used in the paypal account. It it can't be found "n/a" will be returned
// it is inside the default psp ¯\_(ツ)_/¯
export const getPaypalAccountEmail = (paypal: PayPalInfo): string =>
  paypal.pspInfo.find(p => p.default)?.email ??
  I18n.t("wallet.onboarding.paypal.emailNotAvailable");
