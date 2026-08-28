import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { Env } from "../../../common/utils/environment";

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: ProximityMachineDeps;
};

export type ProximityMachineDeps = {
  env: Env;
  navigation: ReturnType<typeof useIONavigation>;
  store: ReturnType<typeof useIOStore>;
};
