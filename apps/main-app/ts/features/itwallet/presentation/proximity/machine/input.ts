import { Env } from "../../../common/utils/environment";
import { MachineNavigation, MachineStore } from "../../../machine/utils/deps";

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: ProximityMachineDeps;
};

export type ProximityMachineDeps = {
  env: Env;
  navigation: MachineNavigation;
  store: MachineStore;
};
