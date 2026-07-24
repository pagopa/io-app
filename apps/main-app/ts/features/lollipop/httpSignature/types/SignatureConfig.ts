import { SignatureAlgorithm } from "./SignatureAlgorithms";
import { SignatureComponents } from "./SignatureComponents";

export interface SignatureConfig {
  nonce: string;
  signAlgorithm: SignatureAlgorithm;
  signatureComponents: SignatureComponents;
  signatureParams: Array<string>;
  signKeyId: string;
  signKeyTag: string;
}
