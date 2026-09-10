import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { Env } from "../../common/utils/environment";
import {
  MachineNavigation,
  MachineStore,
  MachineToast
} from "../../machine/utils/deps";

export type Input = {
  /**
   * The credential type to get the trustmark for
   */
  credentialType: string;
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: TrustmarkMachineDeps;
};

export type TrustmarkMachineDeps = {
  env: Env;
  itwVersion: ItwVersion;
  navigation: MachineNavigation;
  store: MachineStore;
  toast: MachineToast;
};
