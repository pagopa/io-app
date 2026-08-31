import * as t from "io-ts";

import { PatchedWalletV2 } from "./PatchedWalletV2";
// required attributes
const PatchedWalletV2ResponseR = t.interface({});

// optional attributes
const PatchedWalletV2ResponseO = t.partial({
  data: PatchedWalletV2
});

export const PatchedWalletV2Response = t.intersection(
  [PatchedWalletV2ResponseR, PatchedWalletV2ResponseO],
  "PatchedWalletV2Response"
);

export type PatchedWalletV2Response = t.TypeOf<typeof PatchedWalletV2Response>;
