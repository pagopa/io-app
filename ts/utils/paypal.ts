import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PayPalInfo } from "../../definitions/pagopa/PayPalInfo";
import I18n from "../i18n";
import { PspData } from "../../definitions/pagopa/PspData";
import { IOPayPalPsp } from "../features/wallet/onboarding/paypal/types";
import { PayPalPsp } from "../../definitions/pagopa/PayPalPsp";
import { getPayPalPspIconUrl } from "./paymentMethod";

// return the email used in the paypal account. If it can't be found "n/a" will be returned
// it is inside the default psp ¯\_(ツ)_/¯ that could be one in the relative array 'pspInfo'
export const getPaypalAccountEmail = (paypal: PayPalInfo): string =>
  paypal.pspInfo.find(p => p.default)?.email ??
  I18n.t("wallet.onboarding.paypal.emailNotAvailable");

/**
 * convert pspData (one of many PM representations of a psp) into IOPayPalPsp
 * @param psp
 */
export const convertPspData = (psp: PspData): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPayPalPspIconUrl(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.fee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});

// convert a paypal psp returned by the API into the app domain model
export const convertPayPalPsp = (psp: PayPalPsp): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPayPalPspIconUrl(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.maxFee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});
