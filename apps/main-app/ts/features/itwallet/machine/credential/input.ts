import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { Env } from "../../common/utils/environment";
import { MachineNavigation, MachineStore, MachineToast } from "../utils/deps";

export type CredentialIssuanceMachineDeps = {
  env: Env;
  itwVersion: ItwVersion;
  navigation: MachineNavigation;
  store: MachineStore;
  toast: MachineToast;
};

export type Input = { deps: CredentialIssuanceMachineDeps };
