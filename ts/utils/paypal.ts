import I18n from "i18next";
import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";

// return the email used in the paypal account. If it can't be found "n/a" will be returned
// it is inside the default psp ¯\_(ツ)_/¯ that could be one in the relative array 'pspInfo'
export const getPaypalAccountEmail = (paypal: PayPalInfo): string =>
  paypal.pspInfo.find(p => p.default)?.email ??
  I18n.t("wallet.onboarding.paypal.emailNotAvailable");
