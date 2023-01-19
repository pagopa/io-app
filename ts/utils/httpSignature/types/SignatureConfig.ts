import { SignatureAlgorithm } from "./SignatureAlgorithms";
import { SignatureComponents } from "./SignatureComponents";

export interface SignatureConfig {
  signAlgorithm: SignatureAlgorithm;
  signKeyTag: string;
  signKeyId: string;
  signatureComponents: SignatureComponents;
  signatureParams: Array<string>;
}
