import { IOToast } from "@io-app/design-system";
import { ItwVersion } from "@pagopa/io-react-native-wallet";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOStore } from "../../../../store/hooks";
import { Env } from "../../common/utils/environment";

export type CredentialIssuanceMachineDeps = {
  env: Env;
  itwVersion: ItwVersion;
  navigation: ReturnType<typeof useIONavigation>;
  store: ReturnType<typeof useIOStore>;
  toast: IOToast;
};

export type Input = { deps: CredentialIssuanceMachineDeps };
