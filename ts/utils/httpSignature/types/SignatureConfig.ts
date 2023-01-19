import { SignatureAlgorithm } from "./SignatureAlgorithms";
import { SignatureComponents } from "./SignatureComponents";

export interface SignatureConfig {
  digestAlgorithm: string;
  signAlgorithm: SignatureAlgorithm;
  signKeyId: string;
  signatureComponents: SignatureComponents;
  signatureParams: Array<string>;
}
