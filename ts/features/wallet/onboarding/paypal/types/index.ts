// TODO temporary type. It will be shared in the future or replaced with a new one
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";

export type IOPayPalPsp = {
  id: string;
  logoUrl: string;
  name: string;
  fee: NonNegativeNumber;
  privacyUrl: string;
  tosUrl: string;
};
