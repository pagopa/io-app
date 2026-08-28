import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../../store/hooks";
import { Env } from "../../../common/utils/environment";

export type Input = {
  /**
   * Runtime dependencies injected by the machine provider
   */
  deps: RemoteMachineDeps;
};

export type RemoteMachineDeps = {
  env: Env;
  itwVersion: ItwVersion;
  navigation: ReturnType<typeof useIONavigation>;
  store: ReturnType<typeof useIOStore>;
};
