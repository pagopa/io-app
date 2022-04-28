import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PspData } from "../../../../../../definitions/pagopa/PspData";
import { IOPayPalPsp } from "../types";
import { getPspIconUrlFromAbi } from "../../../../../utils/paymentMethod";
import { PayPalPsp } from "../../../../../../definitions/pagopa/PayPalPsp";

/**
 * convert pspData (one of many PM representations of a psp) into IOPayPalPsp
 * @param psp
 */
export const convertPspData = (psp: PspData): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPspIconUrlFromAbi(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.fee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});

// convert a paypal psp returned by the API into the app domain model
export const convertPayPalPsp = (psp: PayPalPsp): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPspIconUrlFromAbi(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.maxFee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});
