import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";

export type IOPayPalPsp = {
  id: string;
  logoUrl: string;
  name: string;
  fee: NonNegativeNumber;
  privacyUrl?: string;
};
