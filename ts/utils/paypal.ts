import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";
import I18n from "../i18n";

export const getPaypalAccountEmail = (paypal: PayPalInfo): string =>
  paypal.pspInfo.find(p => p.default)?.email ??
  I18n.t("wallet.onboarding.paypal.emailNotAvailable");
