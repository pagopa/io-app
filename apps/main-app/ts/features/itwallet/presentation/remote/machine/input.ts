import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { Env } from "../../../common/utils/environment";
import { MachineNavigation, MachineStore } from "../../../machine/utils/deps";

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: RemoteMachineDeps;
};

export type RemoteMachineDeps = {
  env: Env;
  itwVersion: ItwVersion;
  navigation: MachineNavigation;
  store: MachineStore;
};
