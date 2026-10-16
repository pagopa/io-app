import { ItwVersion } from "@pagopa/io-react-native-wallet";

export type StatusListContext = {
  itwVersion: ItwVersion;
};

export type StatusListVerificationContext = StatusListContext & {
  x509CertRoot: string;
};
