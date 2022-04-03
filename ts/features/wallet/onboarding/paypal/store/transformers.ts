import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { PspData } from "../../../../../../definitions/pagopa/PspData";
import { IOPayPalPsp } from "../types";
import { getPayPalPspIconUrl } from "../../../../../utils/paymentMethod";
import { PayPalPsp } from "../../../../../../definitions/pagopa/PayPalPsp";
import { Psp } from "../../../../../types/pagopa";

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

export const convertPspDataToPsp = (psp: PspData): Psp => ({
  id: parseInt(psp.idPsp, 10),
  logoPSP: getPayPalPspIconUrl(psp.codiceAbi),
  fixedCost: {
    currency: "EUR",
    amount: psp.fee,
    decimalDigits: 2
  }
});

export const convertPspToPspData = (psp: Psp): PspData => ({
  codiceAbi: "",
  defaultPsp: true,
  fee: psp.fixedCost.amount,
  idPsp: psp.id.toString(),
  onboard: true,
  ragioneSociale: psp.businessName ?? ""
});

// convert a paypal psp returned by the API into the app domain model
export const convertPayPalPsp = (psp: PayPalPsp): IOPayPalPsp => ({
  id: psp.idPsp,
  logoUrl: getPayPalPspIconUrl(psp.codiceAbi),
  name: psp.ragioneSociale,
  fee: psp.maxFee as NonNegativeNumber,
  privacyUrl: psp.privacyUrl
});
