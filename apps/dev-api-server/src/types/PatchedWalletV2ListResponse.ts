import * as t from "io-ts";

import { PatchedWalletV2 } from "./PatchedWalletV2";

const WalletV2ListResponseR = t.interface({});

// optional attributes
const WalletV2ListResponseO = t.partial({
  data: t.readonlyArray(PatchedWalletV2, "array of PatchedWalletV2")
});

export const PatchedWalletV2ListResponse = t.intersection(
  [WalletV2ListResponseR, WalletV2ListResponseO],
  "WalletV2ListResponse"
);

export type PatchedWalletV2ListResponse = t.TypeOf<
  typeof PatchedWalletV2ListResponse
>;
