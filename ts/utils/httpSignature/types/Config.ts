import { SignatureComponents } from "./SignatureComponents";

export interface Config {
  digestAlgorithm: string;
  signatureComponents: SignatureComponents;
  signatureParams: Array<string>;
}
