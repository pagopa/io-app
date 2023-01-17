import { SignatureAlgorithm } from "./SignatureAlgorithms";
import { SignatureComponents } from "./SignatureComponents";

export interface Config {
  digestAlgorithm: string;
  signAlgorithm: SignatureAlgorithm;
  signatureComponents: SignatureComponents;
  signatureParams: Array<string>;
}
