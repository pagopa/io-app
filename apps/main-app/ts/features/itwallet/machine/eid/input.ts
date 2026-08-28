import { IOToast } from "@io-app/design-system";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { Env } from "../../common/utils/environment";

export type EidIssuanceMachineDeps = {
  env: Env;
  navigation: ReturnType<typeof useIONavigation>;
  store: ReturnType<typeof useIOStore>;
  toast: IOToast;
};

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: EidIssuanceMachineDeps;
};
