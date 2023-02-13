import { KeyInfo } from "./../../utils/crypto";

export type LollipopConfig = {
  keyInfo: KeyInfo;
  nonce: string;
  customSignatures?: ReadonlyArray<string>;
};
