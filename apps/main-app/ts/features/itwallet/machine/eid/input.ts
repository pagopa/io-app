import { Env } from "../../common/utils/environment";
import { MachineNavigation, MachineStore, MachineToast } from "../utils/deps";

export type EidIssuanceMachineDeps = {
  env: Env;
  navigation: MachineNavigation;
  store: MachineStore;
  toast: MachineToast;
};

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: EidIssuanceMachineDeps;
};
